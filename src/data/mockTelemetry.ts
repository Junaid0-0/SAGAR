import { TelemetryState, DetectionLogEntry, ActivityLog, SignalHistoryPoint } from '../types';

export const INITIAL_TELEMETRY: TelemetryState = {
  depth: 4286.4,
  pressure: 42.1,
  temperature: 2.8,
  roll: 1.8,
  pitch: -0.7,
  yaw: 143.2,
  metalResponse: 0.78,
  baselineResponse: 0.31,
  threshold: 0.65,
  signalQuality: 98.7,
  samplingRate: 10,
  battery: 82,
  voltage: 14.7,
  packetLoss: 0.4,
  latency: 126,
  surveyDistance: 2.84,
  areaSurveyed: 1.84,
  measurementsCount: 12842,
  activeAnomaliesCount: 7,
  currentLine: 'L-07',
  completedLines: 18,
  totalLines: 23,
  sensorLatitude: "12°42.18'S",
  sensorLongitude: "74°31.82'E",
  sensorX: 300,
  sensorY: 285,
  status: 'ANOMALY_DETECTED',
  isPaused: false,
  simulationSpeed: 1,
};

export const INITIAL_DETECTION_HISTORY: DetectionLogEntry[] = [
  { id: 'dh-1', time: '14:05:00', depth: 4280, response: 0.29, status: 'Normal', target: '—' },
  { id: 'dh-2', time: '14:12:30', depth: 4284, response: 0.34, status: 'Normal', target: '—' },
  { id: 'dh-3', time: '14:19:12', depth: 4287, response: 0.51, status: 'Elevated', target: 'A-01' },
  { id: 'dh-4', time: '14:24:45', depth: 4290, response: 0.62, status: 'High', target: 'A-02' },
  { id: 'dh-5', time: '14:31:04', depth: 4291, response: 0.78, status: 'Threshold Exceeded', target: 'A-03' },
  { id: 'dh-6', time: '14:38:20', depth: 4302, response: 0.44, status: 'Normal', target: 'A-04' },
  { id: 'dh-7', time: '14:44:02', depth: 4282, response: 0.49, status: 'Elevated', target: 'A-06' },
  { id: 'dh-8', time: '14:52:19', depth: 4295, response: 0.68, status: 'Threshold Exceeded', target: 'A-07' },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { time: '14:05', text: 'Sensor pod deployed from RV Samudra umbilical winch', type: 'info' },
  { time: '14:08', text: 'Reached target depth: 4,286 m (Hydrostatic: 42.1 MPa)', type: 'info' },
  { time: '14:12', text: 'Survey line L-05 completed. Turn maneuver executed.', type: 'info' },
  { time: '14:19', text: 'Elevated electromagnetic response detected (0.51 mV/V)', type: 'warning' },
  { time: '14:24', text: 'Target A-02 logged — Candidate exploration area marked', type: 'warning' },
  { time: '14:31', text: 'Target A-03 detected — Threshold 0.65 mV/V exceeded (0.78 mV/V)', type: 'critical' },
  { time: '14:32', text: 'Current sensor position logged at 12°42.18\'S, 74°31.82\'E', type: 'success' },
];

export const generateInitialSignalHistory = (): SignalHistoryPoint[] => {
  const points: SignalHistoryPoint[] = [];
  const count = 30;
  for (let i = 0; i < count; i++) {
    const minute = 10 + Math.floor(i / 2);
    const sec = (i % 2) * 30;
    const timeStr = `14:${minute.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    
    // Simulate progression towards elevated then peak anomaly at the end
    let resp = 0.30 + Math.sin(i * 0.4) * 0.04 + (Math.random() * 0.02);
    if (i > 15 && i <= 22) {
      // elevated phase
      resp = 0.45 + (i - 15) * 0.02 + Math.random() * 0.03;
    } else if (i > 22) {
      // anomaly phase
      resp = 0.65 + (i - 22) * 0.018 + (Math.random() * 0.03 - 0.01);
    }
    
    points.push({
      time: timeStr,
      response: parseFloat(resp.toFixed(3)),
      baseline: 0.31,
      threshold: 0.65,
      depth: 4284 + Math.sin(i * 0.2) * 4,
      temperature: 2.8 + Math.sin(i * 0.3) * 0.1,
      pressure: 42.1 + (Math.sin(i * 0.2) * 0.08),
      battery: Math.max(75, 83 - i * 0.05),
    });
  }
  return points;
};
