import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TelemetryState,
  TargetAnomaly,
  SurveyMission,
  DetectionLogEntry,
  ActivityLog,
  NotificationItem,
  SignalHistoryPoint,
  PageId
} from '../types';
import { INITIAL_TARGETS } from '../data/mockTargets';
import { MOCK_MISSIONS } from '../data/mockMissions';
import {
  INITIAL_TELEMETRY,
  INITIAL_DETECTION_HISTORY,
  INITIAL_ACTIVITY_LOGS,
  generateInitialSignalHistory
} from '../data/mockTelemetry';
import { SURVEY_LINES, GENERATED_MEASUREMENTS, StaticMeasurementPoint } from '../data/mockSurveyTrack';

interface SimulationContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  telemetry: TelemetryState;
  targets: TargetAnomaly[];
  missions: SurveyMission[];
  detectionHistory: DetectionLogEntry[];
  activityLogs: ActivityLog[];
  signalHistory: SignalHistoryPoint[];
  measurementPoints: StaticMeasurementPoint[];
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  selectedTarget: TargetAnomaly | null;
  setSelectedTarget: (target: TargetAnomaly | null) => void;
  selectedMission: SurveyMission | null;
  setSelectedMission: (mission: SurveyMission | null) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  // Controls
  pauseSurvey: () => void;
  resumeSurvey: () => void;
  markTarget: () => void;
  saveWaypoint: () => void;
  returnToSurface: () => void;
  exportData: (format: string) => void;
  triggerDemoAnomaly: () => void;
  resetDemoToBaseline: () => void;
  toggleTargetQueue: (targetId: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [telemetry, setTelemetry] = useState<TelemetryState>(INITIAL_TELEMETRY);
  const [targets, setTargets] = useState<TargetAnomaly[]>(INITIAL_TARGETS);
  const [missions] = useState<SurveyMission[]>(MOCK_MISSIONS);
  const [detectionHistory, setDetectionHistory] = useState<DetectionLogEntry[]>(INITIAL_DETECTION_HISTORY);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [signalHistory, setSignalHistory] = useState<SignalHistoryPoint[]>(generateInitialSignalHistory);
  const [measurementPoints, setMeasurementPoints] = useState<StaticMeasurementPoint[]>(GENERATED_MEASUREMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'init-1',
      title: 'SYSTEM READY',
      message: 'Telemetry downlink established with RV Samudra.',
      type: 'info',
      timestamp: '14:32:00'
    }
  ]);
  const [selectedTarget, setSelectedTarget] = useState<TargetAnomaly | null>(null);
  const [selectedMission, setSelectedMission] = useState<SurveyMission | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Notification helper
  const addNotification = useCallback((title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newNote: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      timestamp: timeStr,
    };
    setNotifications((prev) => [newNote, ...prev.slice(0, 4)]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Controls
  const pauseSurvey = useCallback(() => {
    setTelemetry((prev) => {
      const nextPaused = !prev.isPaused;
      addNotification(
        nextPaused ? 'SURVEY PAUSED' : 'SURVEY RESUMED',
        nextPaused ? 'Sensor pod in station-keeping position hold.' : 'Autonomous survey transect resumed.',
        'info'
      );
      return { ...prev, isPaused: nextPaused };
    });
  }, [addNotification]);

  const resumeSurvey = useCallback(() => {
    setTelemetry((prev) => ({ ...prev, isPaused: false }));
    addNotification('SURVEY RESUMED', 'Acoustic positioning tracking active.', 'info');
  }, [addNotification]);

  const markTarget = useCallback(() => {
    const code = `A-${(targets.length + 1).toString().padStart(2, '0')}`;
    const newTarget: TargetAnomaly = {
      id: `TARGET ${code}`,
      code,
      status: 'HIGH',
      depth: Math.round(telemetry.depth),
      responseLevel: telemetry.metalResponse > 0.65 ? 'VERY HIGH' : 'HIGH',
      signalStrength: parseFloat(telemetry.metalResponse.toFixed(2)),
      coordinates: {
        lat: telemetry.sensorLatitude,
        lng: telemetry.sensorLongitude,
        x: telemetry.sensorX,
        y: telemetry.sensorY,
      },
      surveyLine: telemetry.currentLine,
      measurements: 42,
      detectionDuration: '00:28',
      timestamp: new Date().toLocaleTimeString(),
      interpretation: 'Operator marked candidate target zone. Elevated magnetic/conductive signature registered during live transect.',
      recommendation: 'TARGET FOR FURTHER SURVEY — Marked by mission supervisor.',
      queuedForSurvey: true,
    };

    setTargets((prev) => [newTarget, ...prev]);
    setSelectedTarget(newTarget);
    addNotification(`TARGET ${code} CREATED`, `Position: ${telemetry.sensorLatitude}, ${telemetry.sensorLongitude}`, 'alert');
  }, [targets.length, telemetry, addNotification]);

  const saveWaypoint = useCallback(() => {
    addNotification(
      'WAYPOINT SAVED',
      `Waypoint logged at ${telemetry.sensorLatitude}, ${telemetry.sensorLongitude} (Depth: ${telemetry.depth.toFixed(1)}m)`,
      'success'
    );
  }, [telemetry, addNotification]);

  const returnToSurface = useCallback(() => {
    addNotification(
      'RECOVERY PROTOCOL INITIATED',
      'Winch hoist speed set to 0.5 m/s. Thrusters disengaged. Surface beacon active.',
      'warning'
    );
  }, [addNotification]);

  const exportData = useCallback((format: string) => {
    addNotification(
      `EXPORT PREPARED (${format.toUpperCase()})`,
      'Demonstration mode — Simulated telemetry and anomaly logs compiled into package.',
      'success'
    );
  }, [addNotification]);

  const toggleTargetQueue = useCallback((targetId: string) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, queuedForSurvey: !t.queuedForSurvey } : t))
    );
  }, []);

  // Demo triggers for presentation & video walkthrough
  const triggerDemoAnomaly = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      metalResponse: 0.78,
      status: 'ANOMALY_DETECTED',
      activeAnomaliesCount: 7,
    }));
    addNotification(
      'TARGET A-03 DETECTED',
      'Threshold 0.65 mV/V exceeded! Metal response peak: 0.78 mV/V. Prioritize for detailed survey.',
      'critical'
    );
  }, [addNotification]);

  const resetDemoToBaseline = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      metalResponse: 0.31,
      status: 'NORMAL',
    }));
    addNotification('BASELINE RESTORED', 'Sensor baseline reset to standard background level (0.31 mV/V).', 'info');
  }, [addNotification]);

  // Central simulation loop
  useEffect(() => {
    if (telemetry.isPaused) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Natural small oscillations
        const depthDrift = (Math.random() - 0.48) * 0.4;
        const newDepth = parseFloat((prev.depth + depthDrift).toFixed(1));
        const newPressure = parseFloat((newDepth * 0.00982).toFixed(1));
        const newTemp = parseFloat((2.8 + (Math.random() - 0.5) * 0.08).toFixed(1));
        const newRoll = parseFloat((prev.roll + (Math.random() - 0.5) * 0.3).toFixed(1));
        const newPitch = parseFloat((prev.pitch + (Math.random() - 0.5) * 0.2).toFixed(1));
        const newYaw = parseFloat((143.2 + (Math.random() - 0.5) * 0.5).toFixed(1));

        // Metal response fluctuation
        let newMetal = prev.metalResponse;
        if (prev.status === 'ANOMALY_DETECTED') {
          newMetal = 0.76 + (Math.random() - 0.48) * 0.04;
        } else if (prev.status === 'ELEVATED') {
          newMetal = 0.55 + (Math.random() - 0.5) * 0.04;
        } else {
          newMetal = 0.31 + (Math.random() - 0.5) * 0.03;
        }
        newMetal = parseFloat(Math.max(0.2, newMetal).toFixed(3));

        // Status transition
        let nextStatus: TelemetryState['status'] = prev.status;
        if (newMetal >= prev.threshold) {
          nextStatus = 'ANOMALY_DETECTED';
        } else if (newMetal >= 0.5) {
          nextStatus = 'ELEVATED';
        } else {
          nextStatus = 'NORMAL';
        }

        // Sensor movement along current line (x stays near 300, y moves slowly)
        let nextY = prev.sensorY + 0.6;
        if (nextY > 440) nextY = 120;

        const nextMeasurements = prev.measurementsCount + Math.floor(Math.random() * 3) + 2;
        const nextDistance = parseFloat((prev.surveyDistance + 0.001).toFixed(3));

        return {
          ...prev,
          depth: newDepth,
          pressure: newPressure,
          temperature: newTemp,
          roll: newRoll,
          pitch: newPitch,
          yaw: newYaw,
          metalResponse: newMetal,
          status: nextStatus,
          sensorY: nextY,
          measurementsCount: nextMeasurements,
          surveyDistance: nextDistance,
        };
      });

      // Update signal history buffer
      setSignalHistory((prev) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newPt: SignalHistoryPoint = {
          time: timeStr,
          response: telemetry.metalResponse,
          baseline: telemetry.baselineResponse,
          threshold: telemetry.threshold,
          depth: telemetry.depth,
          temperature: telemetry.temperature,
          pressure: telemetry.pressure,
          battery: telemetry.battery,
        };
        const updated = [...prev.slice(1), newPt];
        return updated;
      });

    }, 1800);

    return () => clearInterval(interval);
  }, [telemetry.isPaused, telemetry.metalResponse, telemetry.baselineResponse, telemetry.threshold, telemetry.depth, telemetry.temperature, telemetry.pressure, telemetry.battery]);

  return (
    <SimulationContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        telemetry,
        targets,
        missions,
        detectionHistory,
        activityLogs,
        signalHistory,
        measurementPoints,
        notifications,
        dismissNotification,
        addNotification,
        selectedTarget,
        setSelectedTarget,
        selectedMission,
        setSelectedMission,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        pauseSurvey,
        resumeSurvey,
        markTarget,
        saveWaypoint,
        returnToSurface,
        exportData,
        triggerDemoAnomaly,
        resetDemoToBaseline,
        toggleTargetQueue,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
