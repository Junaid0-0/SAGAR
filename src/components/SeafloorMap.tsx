import React, { useState, useRef, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TargetAnomaly } from '../types';
import { BATHYMETRIC_CONTOURS, SURVEY_LINES, StaticMeasurementPoint } from '../data/mockSurveyTrack';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Crosshair,
  Layers as LayersIcon
} from 'lucide-react';

export interface SeafloorMapLayers {
  bathymetry?: boolean;
  surveyCoverage?: boolean;
  surveyTrack?: boolean;
  measurementPoints?: boolean;
  anomalyZones?: boolean;
  depthContours?: boolean;
  temperature?: boolean;
  signalIntensity?: boolean;
  aiPotentialZones?: boolean;
}

interface SeafloorMapProps {
  variant?: 'live' | 'interpretation';
  largeMode?: boolean;
  layers?: SeafloorMapLayers;
  mapMode?: 'bathymetry' | 'anomaly' | 'track';
  selectedTargetCode?: string | null;
  onSelectAnomaly?: (target: TargetAnomaly) => void;
}

export const SeafloorMap: React.FC<SeafloorMapProps> = ({
  variant = 'live',
  largeMode = false,
  layers = {},
  mapMode = 'bathymetry',
  selectedTargetCode = null,
  onSelectAnomaly,
}) => {
  const {
    telemetry,
    targets,
    measurementPoints,
    setSelectedTarget,
    spatialZones,
    showAiZonesOnMap,
  } = useSimulation();

  const isInterpretation = variant === 'interpretation';

  // Resolve layer visibility with sensible defaults based on mode
  const activeLayers = {
    bathymetry: layers.bathymetry ?? true,
    surveyCoverage: layers.surveyCoverage ?? isInterpretation,
    surveyTrack: layers.surveyTrack ?? true,
    measurementPoints: layers.measurementPoints ?? !isInterpretation,
    anomalyZones: layers.anomalyZones ?? true,
    depthContours: layers.depthContours ?? true,
    temperature: layers.temperature ?? false,
    signalIntensity: layers.signalIntensity ?? true,
    aiPotentialZones: layers.aiPotentialZones ?? showAiZonesOnMap ?? true,
  };

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoords, setHoverCoords] = useState<{ lat: string; lng: string; depth: number } | null>(null);
  const [activePoint, setActivePoint] = useState<StaticMeasurementPoint | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport bounding box:
  // - Interpretation mode: spans the complete regional survey grid (L-01 to L-23, x ~ -30 to 930, y ~ 0 to 550)
  // - Live mode: centered on active operational transect area around L-07 with 16:7 aspect ratio
  const surveyBounds = useMemo(() => {
    if (isInterpretation) {
      return { vbX: -30, vbY: 0, vbW: 960, vbH: 550, viewBoxStr: '-30 0 960 550' };
    }

    const xCoords = [
      90, // L-01
      300, // L-07 active transect
      telemetry.sensorX,
      ...targets.map((t) => t.coordinates.x),
      ...targets.map((t) => t.coordinates.x + 50),
    ];
    const yCoords = [
      60,
      485,
      telemetry.sensorY,
      ...targets.map((t) => t.coordinates.y),
    ];

    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const contentHeight = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const paddedHeight = contentHeight / 0.80;
    const aspectRatio = 16 / 7;
    const paddedWidth = paddedHeight * aspectRatio;

    const vbX = Math.round(centerX - paddedWidth / 2);
    const vbY = Math.round(centerY - paddedHeight / 2);
    const vbW = Math.round(paddedWidth);
    const vbH = Math.round(paddedHeight);

    return { vbX, vbY, vbW, vbH, viewBoxStr: `${vbX} ${vbY} ${vbW} ${vbH}` };
  }, [isInterpretation, targets, telemetry.sensorX, telemetry.sensorY]);

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

      const svgX = surveyBounds.vbX + xPct * surveyBounds.vbW;
      const svgY = surveyBounds.vbY + yPct * surveyBounds.vbH;
      const latMinutes = (41.6 + (svgY / 500) * 1.3).toFixed(2);
      const lngMinutes = (31.1 + (svgX / 900) * 1.8).toFixed(2);
      const approxDepth = Math.round(4200 + (svgY / 500) * 190);

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
      className={`relative w-full h-full overflow-hidden rounded-[8px] bg-[#E8F1F3] border border-[#CBD9DA] select-none cursor-${
        isDragging ? 'grabbing' : 'crosshair'
      }`}
    >
      {/* Top Map Status Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#CBD9DA] flex items-center gap-2 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isInterpretation ? 'bg-[#2A7C7A]' : 'bg-[#173B4D]'}`} />
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[#1F4B60] uppercase">
            {isInterpretation
              ? 'REGIONAL SURVEY GRID // 23 TRANSECTS // CIOB-04'
              : `ACTIVE TRANSECT ${telemetry.currentLine} // 50m LINE SPACING`}
          </span>
        </div>
        <div className="hidden sm:flex px-2 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#CBD9DA] text-[10px] font-mono text-[#60868C] shadow-sm">
          DATUM: WGS-84 / UTM ZONE 43S
        </div>
      </div>

      {/* Top-Right Safe Zone: Unified Map Controls Stack (+ / − / N) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-center bg-[#FFFFFF] rounded-[6px] border border-[#CBD9DA] shadow-sm overflow-hidden select-none">
        <button
          onClick={handleZoomIn}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className="w-7 h-7 flex items-center justify-center hover:bg-[#E8F1F3] text-[#1F4B60] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-5 h-[1px] bg-[#CBD9DA]" />
        <button
          onClick={handleZoomOut}
          title="Zoom Out (−)"
          aria-label="Zoom Out"
          className="w-7 h-7 flex items-center justify-center hover:bg-[#E8F1F3] text-[#1F4B60] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-5 h-[1px] bg-[#CBD9DA]" />
        <button
          onClick={handleReset}
          title="Reset View & Orientation (North Up)"
          aria-label="Reset View & Orientation"
          className="w-7 h-7 flex flex-col items-center justify-center hover:bg-[#E8F1F3] text-[#1F4B60] transition-colors gap-0.5"
        >
          <span className="font-mono text-[8.5px] font-bold leading-none text-[#1F4B60]">N</span>
          <Navigation className="w-2.5 h-2.5 text-[#1F4B60] fill-[#DCEBED] transform -rotate-45" />
        </button>
      </div>

      {/* Safe Zone: Bottom-Left Metric Scale Bar */}
      <div className="absolute bottom-9 left-3 z-10 pointer-events-none bg-[#FFFFFF]/95 backdrop-blur-[2px] px-2.5 py-1.5 rounded-[4px] border border-[#CBD9DA] shadow-sm font-mono text-[9px] text-[#1F4B60]">
        <div className="flex justify-between items-center text-[8.5px] text-[#60868C] mb-0.5">
          <span>0m</span>
          <span>250m</span>
          <span>500m</span>
        </div>
        <div className="h-1.5 w-24 bg-[#CBD9DA] rounded-xs overflow-hidden flex border border-[#CBD9DA]">
          <div className="w-1/2 h-full bg-[#1F4B60]" />
          <div className="w-1/2 h-full bg-[#D0E2E6]" />
        </div>
      </div>

      {/* Safe Zone: Bottom-Right Chart Legend */}
      <div className="absolute bottom-9 right-3 z-10 pointer-events-none hidden md:flex flex-col gap-1 bg-[#FFFFFF]/95 backdrop-blur-[2px] p-2.5 rounded-[6px] border border-[#CBD9DA] shadow-sm font-sans text-[10px]">
        <span className="text-[#60868C] text-[8.5px] uppercase font-bold tracking-wider mb-0.5">
          {isInterpretation ? 'SPATIAL MAP LEGEND' : 'CHART LEGEND'}
        </span>

        {isInterpretation ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 bg-[#2A7C7A]/20 border border-[#2A7C7A] rounded-xs" />
              <span className="text-[#1F4B60] font-semibold">Survey Swath (1.84 km²)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#3D8587]" />
              <span className="text-[#1F4B60]">Mapped Transects (18 Lines)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t border-dashed border-[#A1BDC3]" />
              <span className="text-[#60868C]">Planned Transects (5 Lines)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B85C5C] border border-[#FFFFFF]" />
              <span className="text-[#B85C5C] font-semibold">Priority Anomaly (A-03)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#B78332] border border-[#FFFFFF]" />
              <span className="text-[#B78332]">High / Review Target</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-[#E7E5E2] font-mono text-[9px] text-[#60868C]">
              <span>-4,200m</span>
              <div className="h-2 w-12 rounded-xs flex overflow-hidden border border-[#CBD9DA]">
                <div className="w-1/4 h-full bg-[#EBF4F5]" />
                <div className="w-1/4 h-full bg-[#DCEBED]" />
                <div className="w-1/4 h-full bg-[#D0E2E6]" />
                <div className="w-1/4 h-full bg-[#C2D9DE]" />
              </div>
              <span>-4,400m</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-[#173B4D] rounded-xs" />
              <span className="text-[#173B4D] font-bold">Active Transect ({telemetry.currentLine})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#3D8587]" />
              <span className="text-[#173B4D]">Completed Transect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t border-dashed border-[#A1BDC3]" />
              <span className="text-[#355D68]">Planned Transect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#B65353] border border-[#FFFFFF]" />
              <span className="text-[#B65353] font-semibold">High Anomaly (A-03)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#B78332] border border-[#FFFFFF]" />
              <span className="text-[#B78332]">Moderate Anomaly</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rotate-45 bg-[#23847F] border border-white" />
              <span className="text-[#23847F] font-semibold">Active Sensor Pod</span>
            </div>
          </>
        )}
      </div>

      {/* SVG Canvas Map Area */}
      <div
        className="w-full h-full transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <svg
          viewBox={surveyBounds.viewBoxStr}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base Background (#E8F1F3) */}
          <rect x="-350" y="0" width="1400" height="550" fill="#E8F1F3" />

          {/* Bathymetry Depth Tones / Hypsometric Shading Layers */}
          {activeLayers.bathymetry && (
            <g>
              {/* Northern Shallow Ridge Tier (<4,250m) */}
              <path
                d="M -350,0 L 1050,0 L 1050,180 Q 670,165 380,180 T -350,170 Z"
                fill="#EAF2F4"
              />

              {/* Upper Slope Tier (4,250m - 4,300m) */}
              <path
                d="M -350,170 Q 380,180 670,165 L 1050,180 L 1050,290 Q 660,285 370,300 T -350,290 Z"
                fill="#DCEBED"
              />

              {/* Intermediate Ridge Terrace (4,300m - 4,350m) */}
              <path
                d="M -350,290 Q 370,300 660,285 L 1050,290 L 1050,410 Q 700,395 430,425 T -350,410 Z"
                fill="#D0E2E6"
              />

              {/* Deep Basin Slope (4,350m - 4,400m) */}
              <path
                d="M -350,410 Q 430,425 700,395 L 1050,410 L 1050,490 Q 780,480 510,510 T -350,490 Z"
                fill="#C2D9DE"
              />

              {/* Abyssal Trough Basin (>4,400m) */}
              <path
                d="M -350,490 Q 510,510 780,480 L 1050,490 L 1050,550 L -350,550 Z"
                fill="#B0CBD1"
              />

              {/* Localized Volcanic Crater / Depression around A-03 (4,291m local trough) */}
              <ellipse
                cx="300"
                cy="285"
                rx="48"
                ry="28"
                fill="#9FBEC6"
                fillOpacity="0.45"
                stroke="#355D68"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <text
                x="300"
                y="270"
                fill="#1F4B60"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                opacity="0.8"
              >
                -4,291m DEPRESSION
              </text>
            </g>
          )}

          {/* Coordinate Grid Lines */}
          <g stroke="#CBD9DA" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.75">
            {/* Vertical meridians */}
            <line x1="-200" y1="0" x2="-200" y2="550" />
            <line x1="-50" y1="0" x2="-50" y2="550" />
            <line x1="100" y1="0" x2="100" y2="550" />
            <line x1="250" y1="0" x2="250" y2="550" />
            <line x1="400" y1="0" x2="400" y2="550" />
            <line x1="550" y1="0" x2="550" y2="550" />
            <line x1="700" y1="0" x2="700" y2="550" />
            <line x1="850" y1="0" x2="850" y2="550" />
            {/* Horizontal parallels */}
            <line x1="-350" y1="90" x2="1050" y2="90" />
            <line x1="-350" y1="200" x2="1050" y2="200" />
            <line x1="-350" y1="310" x2="1050" y2="310" />
            <line x1="-350" y1="420" x2="1050" y2="420" />
          </g>

          {/* Grid Coordinate Labels (#1F4B60) */}
          <g fill="#1F4B60" fontSize="8.5" fontFamily="monospace">
            <text x="105" y="24">74°31.2'E</text>
            <text x="255" y="24">74°31.5'E</text>
            <text x="405" y="24">74°31.8'E</text>
            <text x="555" y="24">74°32.1'E</text>
            <text x="705" y="24">74°32.4'E</text>
            <text x="855" y="24">74°32.7'E</text>

            <text x="12" y="94">12°41.8'S</text>
            <text x="12" y="204">12°42.1'S</text>
            <text x="12" y="314">12°42.4'S</text>
            <text x="12" y="424">12°42.7'S</text>
          </g>

          {/* Bathymetric Contours (Isobath Lines) */}
          {activeLayers.depthContours && (
            <g>
              {BATHYMETRIC_CONTOURS.map((contour) => (
                <g key={contour.id}>
                  <path
                    d={contour.d}
                    fill="none"
                    stroke="#2A7C7A"
                    strokeWidth={isInterpretation ? 1.6 : 1.3}
                    strokeOpacity={isInterpretation ? 0.75 : 0.55}
                    strokeDasharray={isInterpretation ? '6 3' : '5 3'}
                  />
                  <rect
                    x={contour.labelX - 3}
                    y={contour.labelY - 9}
                    width="46"
                    height="12"
                    rx="2"
                    fill="#FFFFFF"
                    fillOpacity="0.85"
                  />
                  <text
                    x={contour.labelX}
                    y={contour.labelY}
                    fill="#1F4B60"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    -{contour.depth} m
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Complete Survey Coverage Swath Footprint (1.84 km² Mapped Envelope) */}
          {activeLayers.surveyCoverage && (
            <g>
              <rect
                x="70"
                y="65"
                width="640"
                height="420"
                rx="6"
                fill="#2A7C7A"
                fillOpacity="0.08"
                stroke="#2A7C7A"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <rect
                x="76"
                y="71"
                width="240"
                height="15"
                rx="2"
                fill="#FFFFFF"
                fillOpacity="0.9"
                stroke="#CBD9DA"
                strokeWidth="0.8"
              />
              <text
                x="82"
                y="82"
                fill="#2A7C7A"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SURVEY SWATH: 1.84 km² (18 COMPLETED TRANSECTS)
              </text>
            </g>
          )}

          {/* Survey Lines Grid */}
          {activeLayers.surveyTrack && (
            <g>
              {SURVEY_LINES.map((line) => {
                const isCurrent = line.id === telemetry.currentLine;
                const isCompleted = line.completed && !isCurrent;

                // In interpretation mode, do not over-emphasize L-07; present all completed lines uniformly
                const strokeColor = isInterpretation
                  ? (line.completed ? '#3D8587' : '#A1BDC3')
                  : (isCurrent ? '#173B4D' : isCompleted ? '#3D8587' : '#A1BDC3');
                const strokeWidth = isInterpretation
                  ? (line.completed ? 1.4 : 1.0)
                  : (isCurrent ? 3.2 : isCompleted ? 1.6 : 1.1);

                return (
                  <g key={line.id}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={line.completed ? undefined : '4 4'}
                      strokeOpacity={line.completed ? 0.9 : 0.65}
                    />

                    {/* In Live Mode: prominent L-07 tag with ACTIVE banner */}
                    {!isInterpretation && isCurrent ? (
                      <g>
                        <rect
                          x={line.x1 - 18}
                          y={line.y1 - 18}
                          width="36"
                          height="15"
                          rx="3"
                          fill="#173B4D"
                          stroke="#FFFFFF"
                          strokeWidth="0.5"
                        />
                        <text
                          x={line.x1}
                          y={line.y1 - 7}
                          fill="#FFFFFF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {line.name}
                        </text>
                        <rect
                          x={line.x2 - 20}
                          y={line.y2 + 3}
                          width="40"
                          height="13"
                          rx="2"
                          fill="#173B4D"
                        />
                        <text
                          x={line.x2}
                          y={line.y2 + 12}
                          fill="#FFFFFF"
                          fontSize="7.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ACTIVE
                        </text>
                      </g>
                    ) : (
                      /* Clean scientific line labels every 2-3 lines */
                      ['L-01', 'L-04', 'L-07', 'L-10', 'L-14', 'L-18', 'L-23'].includes(line.id) && (
                        <text
                          x={line.x1}
                          y={line.y1 - 6}
                          fill={line.completed ? '#1F4B60' : '#8EA8AE'}
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight={line.completed ? '600' : 'normal'}
                        >
                          {line.name}
                        </text>
                      )
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Temperature Gradient Isotherms Layer */}
          {activeLayers.temperature && (
            <g opacity="0.75">
              <path d="M 20,130 Q 400,95 900,135" fill="none" stroke="#2A7C7A" strokeWidth="1.2" strokeDasharray="5 3" />
              <text x="830" y="132" fill="#2A7C7A" fontSize="8" fontFamily="monospace" fontWeight="bold">2.4°C ISOTHERM</text>

              <path d="M 20,260 Q 450,230 900,270" fill="none" stroke="#2A7C7A" strokeWidth="1.2" strokeDasharray="5 3" />
              <text x="830" y="262" fill="#2A7C7A" fontSize="8" fontFamily="monospace" fontWeight="bold">2.7°C ISOTHERM</text>

              <path d="M 20,410 Q 420,380 900,420" fill="none" stroke="#2A7C7A" strokeWidth="1.2" strokeDasharray="5 3" />
              <text x="830" y="412" fill="#2A7C7A" fontSize="8" fontFamily="monospace" fontWeight="bold">3.0°C ISOTHERM</text>
            </g>
          )}

          {/* Static Logged Measurement Points */}
          {activeLayers.measurementPoints && (
            <g>
              {measurementPoints.map((pt) => {
                const isElevated = pt.response >= 0.5;
                const isThresholdExceeded = pt.response >= 0.65;
                return (
                  <circle
                    key={pt.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={isThresholdExceeded ? 3.5 : isElevated ? 2.5 : 1.8}
                    fill={
                      isThresholdExceeded
                        ? '#B85C5C'
                        : isElevated
                        ? '#B78332'
                        : '#A1BDC3'
                    }
                    fillOpacity={0.85}
                    stroke="#FFFFFF"
                    strokeWidth={isThresholdExceeded ? 0.8 : 0.4}
                    className="cursor-pointer hover:scale-125 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePoint(pt);
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* AI Potential Zones (Spatial Clusters & Regional Resource Envelopes) */}
          {activeLayers.aiPotentialZones && (
            <g>
              {spatialZones.map((zone) => {
                const isHigh = zone.potentialScore >= 4;
                const isAlpha = zone.id === 'ZONE-ALPHA';
                const strokeColor = isHigh ? '#2A7C7A' : '#60868C';
                const fillColor = isHigh ? '#2A7C7A' : '#60868C';
                const width = zone.bounds.maxX - zone.bounds.minX;
                const height = zone.bounds.maxY - zone.bounds.minY;

                return (
                  <g key={zone.id} className="pointer-events-none">
                    {/* Coverage boundary polygon / rounded rect covering clustered targets */}
                    <rect
                      x={zone.bounds.minX}
                      y={zone.bounds.minY}
                      width={width}
                      height={height}
                      rx="16"
                      fill={fillColor}
                      fillOpacity={isAlpha ? 0.08 : 0.05}
                      stroke={strokeColor}
                      strokeWidth={isHigh ? 1.4 : 0.9}
                      strokeDasharray="6 3"
                    />

                    {/* Zone Badge Tag */}
                    <g transform={`translate(${zone.bounds.minX + 6}, ${zone.bounds.minY + 14})`}>
                      <rect
                        x="0"
                        y="-10"
                        width={isAlpha ? 148 : 124}
                        height="15"
                        rx="3"
                        fill="#FFFFFF"
                        fillOpacity="0.95"
                        stroke={strokeColor}
                        strokeWidth="0.8"
                      />
                      <text
                        x="5"
                        y="1"
                        fill={strokeColor}
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {zone.id}: SCORE {zone.potentialScore}/5 [{zone.scoreLabel.toUpperCase()}]
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Anomaly Zones & Spatial Signal Intensity Halos */}
          {activeLayers.anomalyZones && (
            <g>
              {targets.map((tgt) => {
                const isHeroA03 = tgt.code === 'A-03';
                const isSelected = selectedTargetCode === tgt.code;

                return (
                  <g
                    key={tgt.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnomalyClick(tgt);
                    }}
                  >
                    {/* Spatial Inductive Signal Intensity Halos */}
                    {activeLayers.signalIntensity && (
                      <g>
                        {isHeroA03 ? (
                          <>
                            <circle cx={tgt.coordinates.x} cy={tgt.coordinates.y} r="38" fill="#B85C5C" fillOpacity="0.08" />
                            <circle cx={tgt.coordinates.x} cy={tgt.coordinates.y} r="24" fill="#B85C5C" fillOpacity="0.12" />
                            <circle cx={tgt.coordinates.x} cy={tgt.coordinates.y} r="14" fill="#B85C5C" fillOpacity="0.18" stroke="#B85C5C" strokeWidth="1" strokeDasharray="3 2" />
                          </>
                        ) : tgt.status === 'HIGH' ? (
                          <>
                            <circle cx={tgt.coordinates.x} cy={tgt.coordinates.y} r="24" fill="#B78332" fillOpacity="0.08" />
                            <circle cx={tgt.coordinates.x} cy={tgt.coordinates.y} r="14" fill="#B78332" fillOpacity="0.14" stroke="#B78332" strokeWidth="0.8" strokeDasharray="2 2" />
                          </>
                        ) : (
                          <circle cx={tgt.coordinates.x} cy={tgt.coordinates.y} r="10" fill="#2A7C7A" fillOpacity="0.08" stroke="#2A7C7A" strokeWidth="0.6" strokeDasharray="2 2" />
                        )}
                      </g>
                    )}

                    {/* Target Anchor Center Marker */}
                    <circle
                      cx={tgt.coordinates.x}
                      cy={tgt.coordinates.y}
                      r={isHeroA03 ? 5 : 3.5}
                      fill={isHeroA03 ? '#B85C5C' : tgt.status === 'HIGH' ? '#B78332' : '#2A7C7A'}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />

                    {/* Standard Target Label */}
                    <rect
                      x={tgt.coordinates.x + (isHeroA03 ? 10 : 7)}
                      y={tgt.coordinates.y - 8}
                      width={isHeroA03 ? 72 : 54}
                      height="16"
                      rx="3"
                      fill="#FFFFFF"
                      stroke={isHeroA03 ? '#B85C5C' : '#CBD9DA'}
                      strokeWidth={isHeroA03 ? 1.2 : 0.8}
                    />
                    <text
                      x={tgt.coordinates.x + (isHeroA03 ? 14 : 10)}
                      y={tgt.coordinates.y + 3}
                      fill={isHeroA03 ? '#B85C5C' : '#1F4B60'}
                      fontSize={isHeroA03 ? '8.5' : '7.5'}
                      fontFamily="monospace"
                      fontWeight={isHeroA03 ? 'bold' : '600'}
                    >
                      {tgt.code} ({tgt.signalStrength}mV)
                    </text>

                    {/* Active Target Focus Reticle (when selected from right panel or clicked) */}
                    {isSelected && (
                      <g className="pointer-events-none">
                        <circle
                          cx={tgt.coordinates.x}
                          cy={tgt.coordinates.y}
                          r="20"
                          fill="none"
                          stroke={isHeroA03 ? '#B85C5C' : '#2A7C7A'}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        <line x1={tgt.coordinates.x - 28} y1={tgt.coordinates.y} x2={tgt.coordinates.x - 18} y2={tgt.coordinates.y} stroke={isHeroA03 ? '#B85C5C' : '#2A7C7A'} strokeWidth="2" />
                        <line x1={tgt.coordinates.x + 18} y1={tgt.coordinates.y} x2={tgt.coordinates.x + 28} y2={tgt.coordinates.y} stroke={isHeroA03 ? '#B85C5C' : '#2A7C7A'} strokeWidth="2" />
                        <line x1={tgt.coordinates.x} y1={tgt.coordinates.y - 28} x2={tgt.coordinates.x} y2={tgt.coordinates.y - 18} stroke={isHeroA03 ? '#B85C5C' : '#2A7C7A'} strokeWidth="2" />
                        <line x1={tgt.coordinates.x} y1={tgt.coordinates.y + 18} x2={tgt.coordinates.x} y2={tgt.coordinates.y + 28} stroke={isHeroA03 ? '#B85C5C' : '#2A7C7A'} strokeWidth="2" />

                        {/* High-visibility Target Inspection Banner */}
                        <rect
                          x={tgt.coordinates.x - 45}
                          y={tgt.coordinates.y - 36}
                          width="90"
                          height="18"
                          rx="3"
                          fill="#1F4B60"
                        />
                        <text
                          x={tgt.coordinates.x}
                          y={tgt.coordinates.y - 24}
                          fill="#FFFFFF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          SELECTED {tgt.code}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Active Sensor Pod Indicator */}
          <g transform={`translate(${telemetry.sensorX}, ${telemetry.sensorY})`}>
            {/* Sensor Pod Diamond (#2A7C7A) */}
            <polygon
              points="0,-7 7,0 0,7 -7,0"
              fill="#2A7C7A"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Heading Vector */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="12"
              stroke="#1F4B60"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Subtle Pod Label */}
            <rect
              x="-60"
              y="-9"
              width="50"
              height="16"
              rx="2.5"
              fill="#FFFFFF"
              stroke="#2A7C7A"
              strokeWidth="1"
            />
            <text
              x="-35"
              y="2"
              fill="#1F4B60"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              POD-01
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Measurement Point Tooltip Popup */}
      {activePoint && (
        <div
          className="absolute z-20 bg-[#FFFFFF] border border-[#CBD9DA] p-2.5 rounded-[6px] shadow-md text-xs font-mono pointer-events-auto max-w-xs"
          style={{ top: '35%', left: '40%' }}
        >
          <div className="flex items-center justify-between border-b border-[#E7E5E2] pb-1 mb-1.5 text-[#1F4B60] font-bold">
            <span>SOUNDING ID: {activePoint.id.toUpperCase()}</span>
            <button
              onClick={() => setActivePoint(null)}
              className="text-[#60868C] hover:text-[#1F4B60] ml-2 text-sm"
            >
              ×
            </button>
          </div>
          <div className="space-y-0.5 text-[#60868C] text-[11px]">
            <div>Line: <span className="text-[#1F4B60] font-semibold">{activePoint.line}</span></div>
            <div>Time: <span className="text-[#1F4B60] font-semibold">{activePoint.time}</span></div>
            <div>Depth: <span className="text-[#1F4B60] font-semibold">{activePoint.depth} m</span></div>
            <div>
              Metal Response:{' '}
              <span
                className={`font-bold ${
                  activePoint.response >= 0.65
                    ? 'text-[#B85C5C]'
                    : activePoint.response >= 0.5
                    ? 'text-[#B78332]'
                    : 'text-[#2A7C7A]'
                }`}
              >
                {activePoint.response} mV/V
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Safe Zone: Bottom / Lower Area Cursor Position & Depth Readout */}
      <div className="absolute bottom-2 left-3 right-3 z-10 flex items-center justify-between text-[10px] font-mono text-[#60868C] pointer-events-none">
        <div className="flex items-center gap-2 bg-[#FFFFFF]/95 backdrop-blur-[2px] px-2.5 py-1 rounded-[4px] border border-[#CBD9DA] shadow-sm">
          <span className="flex items-center gap-1 text-[#2A7C7A] font-semibold">
            <Crosshair className="w-3 h-3 text-[#2A7C7A]" /> CURSOR:
          </span>
          <span className="text-[#1F4B60]">
            {hoverCoords
              ? `${hoverCoords.lat}, ${hoverCoords.lng} | DEPTH: -${hoverCoords.depth}m`
              : `${telemetry.sensorLatitude}, ${telemetry.sensorLongitude} | DEPTH: -${Math.round(telemetry.depth)}m`}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-[2px] px-2.5 py-1 rounded-[4px] border border-[#CBD9DA] text-[9.5px] text-[#60868C] shadow-sm">
          <span>SURVEY GRID: CIOB-04</span>
          <span>•</span>
          <span className="text-[#2A7C7A] font-semibold">ACOUSTIC USBL LOCK</span>
        </div>
      </div>
    </div>
  );
};

export default SeafloorMap;
