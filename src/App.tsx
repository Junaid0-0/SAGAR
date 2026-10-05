import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotificationToast } from './components/NotificationToast';
import { TargetModal } from './components/TargetModal';
import { MissionModal } from './components/MissionModal';

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
import { AiAnalysis } from './pages/AiAnalysis';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F2F6F6] text-[#1F4B60]">
      {/* Top Header - Permanent Shell */}
      <Header />

      {/* Main Layout: Permanent Left Sidebar + Scrollable Page Content */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#F2F6F6] flex flex-col justify-between">
          <div className="flex-1 pb-8">
            <Outlet />
          </div>

          {/* Bottom Prototype Disclaimer Bar */}
          <footer className="h-7 bg-[#FFFFFF] border-t border-[#B8CCD1] px-4 flex items-center justify-between text-[10px] font-mono text-[#60868C] z-10 select-none">
            <span>
              SAGAR &bull; SEAFLOOR ANALYSIS AND GEOSPATIAL ASSESSMENT FOR RESOURCE EXPLORATION &bull; MARINE INSTRUMENTATION PLATFORM
            </span>
            <span className="text-[#2A7C7A] font-medium">
              Prototype interface — simulated telemetry for demonstration.
            </span>
          </footer>
        </main>
      </div>

      {/* Modals & Overlays */}
      <TargetModal />
      <MissionModal />
      <NotificationToast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Default Route: Redirect / to /overview */}
            <Route path="/" element={<Navigate to="/overview" replace />} />

            {/* Standard Application Routes */}
            <Route path="/overview" element={<MissionOverview />} />
            <Route path="/live-survey" element={<LiveSurvey />} />
            <Route path="/seafloor-map" element={<SeafloorMapPage />} />
            <Route path="/metal-detection" element={<MetalDetection />} />
            <Route path="/target-zones" element={<TargetZones />} />
            <Route path="/ai-analysis" element={<AiAnalysis />} />
            <Route path="/telemetry" element={<TelemetryData />} />
            <Route path="/survey-history" element={<SurveyHistory />} />
            <Route path="/diagnostics" element={<SensorDiagnostics />} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="/configuration" element={<Configuration />} />

            {/* Unmatched routes redirect to /overview */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </SimulationProvider>
    </BrowserRouter>
  );
};

export default App;
