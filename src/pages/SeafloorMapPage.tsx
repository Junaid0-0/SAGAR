import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SeafloorMap } from '../components/SeafloorMap';
import {
  Layers,
  Map as MapIcon,
  FileDown,
  Mountain,
  Target,
  Compass,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export const SeafloorMapPage: React.FC = () => {
  const { setSelectedTarget, exportData, targets, telemetry } = useSimulation();

  // Selected Target Code for highlighting on the 2D survey map
  const [selectedTargetCode, setSelectedTargetCode] = useState<string | null>('A-03');

  // Layer toggles for 2D seafloor survey map
  const [layers, setLayers] = useState({
    bathymetry: true,
    surveyCoverage: true,
    surveyTrack: true,
    anomalyZones: true,
    depthContours: true,
    signalIntensity: true,
    aiPotentialZones: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const coveragePct = Math.round((telemetry.completedLines / telemetry.totalLines) * 100);

  const metalDetectedCount = targets.filter(
    (t) => t.classification === 'METAL DETECTED'
  ).length;

  const magneticAnomaliesCount = targets.filter(
    (t) => t.classification === 'MAGNETIC ANOMALY'
  ).length;

  const unclassifiedCount = targets.filter(
    (t) => t.classification === 'UNCLASSIFIED ANOMALY'
  ).length;

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto select-none font-sans">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CBD9DA]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-sans font-semibold tracking-wide text-[#1F4B60] uppercase">
              SEAFLOOR MAP
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#E2EFF0] text-[#2A7C7A] border border-[#CBD9DA]">
              2D BATHYMETRIC SURVEY MAP
            </span>
          </div>
          <p className="text-xs text-[#60868C] font-sans mt-0.5">
            Seabed Depth Contours, Survey Transect Coverage & Detected Target Locations
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-[#FFFFFF] px-3 py-1.5 rounded-[6px] border border-[#CBD9DA] shadow-sm flex items-center gap-1.5">
            <span className="text-[#60868C]">POS:</span>
            <span className="font-semibold text-[#1F4B60]">
              {telemetry.sensorLatitude}, {telemetry.sensorLongitude}
            </span>
          </div>
          <div className="bg-[#FFFFFF] px-3 py-1.5 rounded-[6px] border border-[#CBD9DA] shadow-sm flex items-center gap-1.5">
            <span className="text-[#60868C]">LINE:</span>
            <span className="font-semibold text-[#2A7C7A]">{telemetry.currentLine}</span>
          </div>

          <button
            onClick={() => exportData('geotiff-bathymetry')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F2F6F6] text-[#1F4B60] border border-[#CBD9DA] text-xs font-sans font-medium transition-colors shadow-sm ml-1"
            title="Export GIS GeoTIFF Grid"
          >
            <FileDown className="w-3.5 h-3.5 text-[#60868C]" />
            <span>Export GIS</span>
          </button>
        </div>
      </div>

      {/* 2. LARGE FULL-WIDTH 2D MAP VIEW (Occupies ~75-80% of useful height, map-first) */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-3 shadow-sm flex flex-col">
        {/* Layer Controls Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7E5E2] mb-2.5">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-[#2A7C7A]" />
            <h3 className="font-sans text-xs font-semibold tracking-wide text-[#1F4B60] uppercase">
              2D SEAFLOOR SURVEY MAP
            </h3>
            <span className="text-[10px] font-mono text-[#60868C]">
              (CENTRAL INDIAN OCEAN BASIN &bull; 50m TRANSECT GRID)
            </span>
          </div>

          {/* Quick Layer Filter Chips */}
          <div className="flex items-center gap-1.5 text-[11px] font-sans">
            <button
              onClick={() => toggleLayer('depthContours')}
              className={`px-2.5 py-0.5 rounded-[4px] border font-medium transition-colors ${
                layers.depthContours
                  ? 'bg-[#E2EFF0] text-[#2A7C7A] border-[#2A7C7A]/50 font-semibold'
                  : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
              }`}
            >
              Depth Contours
            </button>
            <button
              onClick={() => toggleLayer('surveyTrack')}
              className={`px-2.5 py-0.5 rounded-[4px] border font-medium transition-colors ${
                layers.surveyTrack
                  ? 'bg-[#E2EFF0] text-[#2A7C7A] border-[#2A7C7A]/50 font-semibold'
                  : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
              }`}
            >
              Survey Lines
            </button>
            <button
              onClick={() => toggleLayer('anomalyZones')}
              className={`px-2.5 py-0.5 rounded-[4px] border font-medium transition-colors ${
                layers.anomalyZones
                  ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#B85C5C]/50 font-semibold'
                  : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
              }`}
            >
              Targets
            </button>
            <button
              onClick={() => toggleLayer('surveyCoverage')}
              className={`px-2.5 py-0.5 rounded-[4px] border font-medium transition-colors ${
                layers.surveyCoverage
                  ? 'bg-[#E2EFF0] text-[#2A7C7A] border-[#2A7C7A]/50 font-semibold'
                  : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
              }`}
            >
              Coverage Swath
            </button>
            <button
              onClick={() => toggleLayer('aiPotentialZones')}
              className={`px-2.5 py-0.5 rounded-[4px] border font-medium transition-colors ${
                layers.aiPotentialZones
                  ? 'bg-[#E2EFF0] text-[#1D5E5C] border-[#1D5E5C]/50 font-semibold'
                  : 'bg-[#FFFFFF] text-[#60868C] border-[#CBD9DA]'
              }`}
            >
              AI Potential Zones
            </button>
          </div>
        </div>

        {/* Large 2D Map Container (Height ~70vh, Full Width) */}
        <div className="w-full h-[68vh] min-h-[520px] max-h-[740px] relative rounded-[6px] overflow-hidden border border-[#CBD9DA] shadow-inner bg-[#E8F1F3]">
          <SeafloorMap
            variant="interpretation"
            layers={layers}
            selectedTargetCode={selectedTargetCode}
            onSelectAnomaly={(tgt) => {
              setSelectedTargetCode(tgt.code);
              setSelectedTarget(tgt);
            }}
          />
        </div>

        {/* Map Legend & Metadata Footnote Bar */}
        <div className="pt-2 mt-2 border-t border-[#E7E5E2] flex flex-wrap items-center justify-between text-[11px] font-sans text-[#60868C]">
          <div className="flex items-center gap-3">
            <span>Projection: <strong>UTM Zone 43S / WGS-84</strong></span>
            <span>&bull;</span>
            <span>Vertical Datum: <strong>Mean Sea Level (MSL)</strong></span>
            <span>&bull;</span>
            <span>Grid Extent: <strong>960m &times; 550m</strong></span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B85C5C]" /> Metal Detected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B78332]" /> Magnetic Anomaly
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2A7C7A]" /> Sensor Pod
            </span>
          </div>
        </div>
      </div>

      {/* 3. DETAILS / TELEMETRY SUMMARY (Compact Horizontal Sections Underneath Map) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: BATHYMETRY */}
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#1F4B60]">
              <Mountain className="w-3.5 h-3.5 text-[#2A7C7A]" />
              <span>BATHYMETRY</span>
            </div>
            <span className="text-[10px] font-mono text-[#60868C]">CONTOURS</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Current Depth:</span>
              <span className="font-bold text-[#1F4B60]">{telemetry.depth.toFixed(1)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Depth Range:</span>
              <span className="font-semibold text-[#1F4B60]">-4,200 to -4,410 m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Contour Interval:</span>
              <span className="font-semibold text-[#2A7C7A]">50 m (25 m inter.)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Map Type:</span>
              <span className="font-semibold text-[#1F4B60]">2D Bathymetric</span>
            </div>
          </div>
        </div>

        {/* CARD 2: SURVEY COVERAGE */}
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#1F4B60]">
              <Layers className="w-3.5 h-3.5 text-[#2A7C7A]" />
              <span>SURVEY COVERAGE</span>
            </div>
            <span className="text-[10px] font-mono text-[#3F8068] font-semibold">PHASE 1</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Survey Lines:</span>
              <span className="font-bold text-[#1F4B60]">{telemetry.totalLines} Lines</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Completed Lines:</span>
              <span className="font-semibold text-[#2A7C7A]">{telemetry.completedLines} of {telemetry.totalLines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Coverage:</span>
              <span className="font-bold text-[#2A7C7A]">{coveragePct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Surveyed Area:</span>
              <span className="font-semibold text-[#1F4B60]">{telemetry.areaSurveyed.toFixed(2)} km²</span>
            </div>
          </div>
        </div>

        {/* CARD 3: DETECTIONS */}
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#1F4B60]">
              <Target className="w-3.5 h-3.5 text-[#B85C5C]" />
              <span>DETECTIONS</span>
            </div>
            <span className="text-[10px] font-mono text-[#B85C5C] font-semibold">{targets.length} LOGGED</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Metal Detected:</span>
              <span className="font-bold text-[#B85C5C]">{metalDetectedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Magnetic Anomalies:</span>
              <span className="font-semibold text-[#B78332]">{magneticAnomaliesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Unclassified:</span>
              <span className="font-semibold text-[#60868C]">{unclassifiedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Total Targets:</span>
              <span className="font-bold text-[#1F4B60]">{targets.length}</span>
            </div>
          </div>
        </div>

        {/* CARD 4: MAP STATUS */}
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#CBD9DA] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#1F4B60]">
              <Navigation className="w-3.5 h-3.5 text-[#2A7C7A]" />
              <span>MAP STATUS</span>
            </div>
            <span className="text-[10px] font-mono text-[#3F8068] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
              LIVE
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Map Type:</span>
              <span className="font-semibold text-[#1F4B60]">2D Bathymetric</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">GPS / Datum:</span>
              <span className="font-semibold text-[#2A7C7A]">WGS-84 / UTM 43S</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Survey Line:</span>
              <span className="font-bold text-[#1F4B60]">Line {telemetry.currentLine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#60868C] font-sans">Telemetry Sync:</span>
              <span className="font-semibold text-[#3F8068]">Active (10 Hz)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeafloorMapPage;
