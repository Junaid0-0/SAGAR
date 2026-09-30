export type PageId =
  | 'overview'
  | 'live-survey'
  | 'seafloor-map'
  | 'metal-detection'
  | 'target-zones'
  | 'telemetry-data'
  | 'survey-history'
  | 'sensor-diagnostics'
  | 'system-status'
  | 'configuration';

export interface TelemetryState {
  depth: number; // in meters (e.g. 4286.4)
  pressure: number; // in MPa (e.g. 42.1)
  temperature: number; // in °C (e.g. 2.8)
  roll: number; // in deg (e.g. +1.8)
  pitch: number; // in deg (e.g. -0.7)
  yaw: number; // in deg (e.g. 143.2)
  metalResponse: number; // in mV/V (baseline 0.31, elevated 0.55+, anomaly >0.65)
  baselineResponse: number; // 0.31 mV/V
  threshold: number; // 0.65 mV/V
  signalQuality: number; // in % (e.g. 98.7)
  samplingRate: number; // Hz (10)
  battery: number; // % (82)
  voltage: number; // V (14.7)
  packetLoss: number; // % (0.4)
  latency: number; // ms (126)
  surveyDistance: number; // km (2.84)
  areaSurveyed: number; // km² (1.84)
  measurementsCount: number; // 12842
  activeAnomaliesCount: number; // 7
  currentLine: string; // "L-07"
  completedLines: number; // 18
  totalLines: number; // 23
  sensorLatitude: string; // 12°42.18'S
  sensorLongitude: string; // 74°31.82'E
  sensorX: number; // map normalized 0-100 or coordinate
  sensorY: number; // map normalized 0-100 or coordinate
  status: 'NORMAL' | 'ELEVATED' | 'ANOMALY_DETECTED';
  isPaused: boolean;
  simulationSpeed: number; // 1x, 2x, etc.
}

export interface TargetAnomaly {
  id: string; // e.g. "TARGET A-01"
  code: string; // "A-01"
  status: 'REVIEW' | 'HIGH' | 'PRIORITY' | 'LOW';
  depth: number; // m
  responseLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  signalStrength: number; // mV/V
  coordinates: {
    lat: string;
    lng: string;
    x: number; // 0 - 800 SVG map coordinate
    y: number; // 0 - 500 SVG map coordinate
  };
  surveyLine: string;
  measurements: number;
  detectionDuration: string;
  timestamp: string;
  interpretation: string;
  recommendation: string;
  queuedForSurvey: boolean;
  detectedAtSurveyProgress?: number;
}

export interface SurveyMission {
  id: string;
  name: string;
  date: string;
  depth: number;
  distance: number;
  area: number;
  measurements: number;
  anomalies: number;
  status: 'ACTIVE' | 'COMPLETED';
  vessel: string;
  location: string;
  primaryZone: string;
  summary: string;
}

export interface DetectionLogEntry {
  id: string;
  time: string;
  depth: number;
  response: number;
  status: 'Normal' | 'Elevated' | 'High' | 'Threshold Exceeded';
  target: string;
}

export interface ActivityLog {
  time: string;
  text: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success' | 'critical';
  timestamp: string;
}

export interface SignalHistoryPoint {
  time: string;
  response: number;
  baseline: number;
  threshold: number;
  depth: number;
  temperature: number;
  pressure: number;
  battery: number;
}
