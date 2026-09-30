import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotificationToast } from './components/NotificationToast';
import { TargetModal } from './components/TargetModal';
import { MissionModal } from './components/MissionModal';
import { DemoControls } from './components/DemoControls';

// Pages
import { MissionOverview } from './pages/MissionOverview';
import { LiveSurvey } from './pages/LiveSurvey';
import { SeafloorMapPage } from './pages/SeafloorMapPage';
import { MetalDetection } from './pages/MetalDetection';
import { TargetZones } from './pages/TargetZones';
import { TelemetryData } from './pages/TelemetryData';
import { SurveyHistory } from './pages/SurveyHistory';
import { SensorDiagnostics } from './pages/SensorDiagnostics';
import { SystemStatus } from './pages/SystemStatus';
import { Configuration } from './pages/Configuration';

const AppContent: React.FC = () => {
  const { currentPage } = useSimulation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <MissionOverview />;
      case 'live-survey':
        return <LiveSurvey />;
      case 'seafloor-map':
        return <SeafloorMapPage />;
      case 'metal-detection':
        return <MetalDetection />;
      case 'target-zones':
        return <TargetZones />;
      case 'telemetry-data':
        return <TelemetryData />;
      case 'survey-history':
        return <SurveyHistory />;
      case 'sensor-diagnostics':
        return <SensorDiagnostics />;
      case 'system-status':
        return <SystemStatus />;
      case 'configuration':
        return <Configuration />;
      default:
        return <MissionOverview />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#050c18] text-slate-200">
      {/* Top Header - Permanent */}
      <Header />

      {/* Main Layout: Permanent Left Sidebar + Scrollable Page Content */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gradient-to-br from-[#050c18] via-[#071325] to-[#040915] flex flex-col justify-between">
          <div className="flex-1 pb-8">
            {renderCurrentPage()}
          </div>

          {/* Bottom Prototype Disclaimer Bar as explicitly requested */}
          <footer className="h-7 bg-ocean-950/90 border-t border-slate-800/80 px-4 flex items-center justify-between text-[10px] font-mono text-slate-500 z-10 select-none">
            <span>
              PRAGYA-SEA &bull; SEABED ANOMALY SCREENING PLATFORM &bull; SIH HARDWARE PROTOTYPE
            </span>
            <span className="text-cyan-400/80">
              Prototype interface — simulated telemetry for demonstration.
            </span>
          </footer>
        </main>
      </div>

      {/* Modals & Overlays */}
      <TargetModal />
      <MissionModal />
      <NotificationToast />
      <DemoControls />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
};

export default App;
