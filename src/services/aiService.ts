import { TargetAnomaly, TelemetryState } from '../types';
import { SpatialZone } from '../utils/zoneClustering';

export interface AiServiceStatus {
  available: boolean;
  configured: boolean;
  model: string;
  mode: 'live' | 'simulation-fallback';
}

export interface TargetAiAnalysis {
  targetId: string;
  code: string;
  classification: 'METAL_RESPONSE' | 'MAGNETIC_ANOMALY' | 'UNCLASSIFIED_ANOMALY' | 'BACKGROUND' | 'INSUFFICIENT_DATA';
  confidence: number;
  magnetic_behavior: string;
  mineral_potential: number; // 0 - 100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
  explanation: string;
  source: 'gemini-live' | 'local-deterministic';
  modelUsed?: string;
  timestamp: string;
}

export interface ZoneAiInterpretation {
  zoneId: string;
  potentialScore: number;
  scoreLabel: 'Very Low' | 'Low' | 'Weak' | 'Moderate' | 'High' | 'Very High';
  reason: string;
  recommendedAction: string;
}

export interface ZonesAnalysisResponse {
  zones: ZoneAiInterpretation[];
  missionRecommendations: string[];
  source: 'gemini-live' | 'local-deterministic';
  modelUsed?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function sendChatQuery(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  missionContext: any
): Promise<{ answer: string; source: 'gemini-live' | 'local-deterministic'; modelUsed?: string }> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, missionContext }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function fetchAiStatus(): Promise<AiServiceStatus> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      available: true,
      configured: false,
      model: 'gemini-1.5-flash',
      mode: 'simulation-fallback',
    };
  }
}

export async function requestTargetAiAnalysis(
  target: TargetAnomaly,
  telemetry: TelemetryState,
  nearbyCount: number = 1
): Promise<TargetAiAnalysis> {
  // Synthesize RM3100 magnetometer vector data based on target classification and coordinates
  const isMetal = target.classification === 'METAL DETECTED';
  const isMag = target.classification === 'MAGNETIC ANOMALY';
  const dev = isMetal ? 1.9 : isMag ? 2.4 : 0.45;

  const payload = {
    targetId: target.id,
    code: target.code,
    depth: target.depth || telemetry.depth,
    temperature: telemetry.temperature,
    pressure: telemetry.pressure,
    metalResponse: target.signalStrength,
    baselineResponse: telemetry.baselineResponse,
    threshold: telemetry.threshold,
    responseDeviation: parseFloat(Math.abs(target.signalStrength - telemetry.baselineResponse).toFixed(3)),
    detectionDuration: target.detectionDuration,
    surveyLine: target.surveyLine,
    coordinates: target.coordinates,
    rm3100: {
      bx: 18.4,
      by: -12.1,
      bz: isMetal ? 39.8 : isMag ? 43.2 : 36.5,
      totalField: isMetal ? 44.8 : isMag ? 47.9 : 42.1,
      baselineField: 42.5,
      deviation: dev,
      threshold: 1.2,
    },
    nearbyTargetsCount: nearbyCount,
  };

  const res = await fetch('/api/gemini/analyze-target', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Target analysis request failed: HTTP ${res.status}`);
  }

  return await res.json();
}

export async function requestZonesAiAnalysis(
  zones: SpatialZone[]
): Promise<ZonesAnalysisResponse> {
  const clusters = zones.map(z => ({
    zoneId: z.id,
    name: z.name,
    targetCodes: z.targetCodes,
    centroid: z.centroid,
    radius: z.bounds.radius,
    avgMetalResponse: z.avgMetalResponse,
    maxMetalResponse: z.maxMetalResponse,
    avgMagneticDeviation: z.avgMagneticDeviation,
    dominantClassification: z.dominantClassification,
    supportingTargetCount: z.supportingTargetCount,
    calculatedScore: z.potentialScore,
  }));

  const res = await fetch('/api/gemini/analyze-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clusters }),
  });

  if (!res.ok) {
    throw new Error(`Zones analysis request failed: HTTP ${res.status}`);
  }

  return await res.json();
}
