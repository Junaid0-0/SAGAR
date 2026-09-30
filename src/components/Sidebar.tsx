import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { PageId } from '../types';
import {
  Compass,
  Radio,
  Map as MapIcon,
  Activity,
  Target,
  Database,
  History,
  Cpu,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  BatteryCharging,
  Layers,
  Waves
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'red' | 'amber' | 'cyan';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    telemetry,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    targets
  } = useSimulation();

  const highPriorityTargetsCount = targets.filter(t => t.status === 'PRIORITY' || t.status === 'HIGH').length;

  const navigationSections: NavSection[] = [
    {
      title: 'MISSION',
      items: [
        { id: 'overview', label: 'Mission Overview', icon: <Compass className="w-4 h-4" /> },
        { id: 'live-survey', label: 'Live Survey', icon: <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> },
        { id: 'seafloor-map', label: 'Seafloor Map', icon: <MapIcon className="w-4 h-4" /> },
      ],
    },
    {
      title: 'DETECTION',
      items: [
        {
          id: 'metal-detection',
          label: 'Metal Detection',
          icon: <Activity className="w-4 h-4 text-amber-400" />,
          badge: telemetry.metalResponse >= telemetry.threshold ? 'HIGH' : undefined,
          badgeVariant: 'amber',
        },
        {
          id: 'target-zones',
          label: 'Target Zones',
          icon: <Target className="w-4 h-4 text-rose-400" />,
          badge: `${highPriorityTargetsCount} DETECTED`,
          badgeVariant: 'red',
        },
      ],
    },
    {
      title: 'DATA',
      items: [
        { id: 'telemetry-data', label: 'Telemetry & Data', icon: <Database className="w-4 h-4" /> },
        { id: 'survey-history', label: 'Survey History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'sensor-diagnostics', label: 'Sensor Diagnostics', icon: <Cpu className="w-4 h-4" /> },
        { id: 'system-status', label: 'System Status', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'configuration', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between h-[calc(100vh-4rem)] bg-ocean-900 border-r border-slate-800/80 transition-all duration-300 ease-in-out z-20 select-none ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-[250px]'
      }`}
    >
      {/* Top Branding */}
      <div className="p-4 border-b border-slate-800/80 relative">
        <div className="flex items-center gap-3">
          {/* Custom Ocean Wave + Signal Marker Logo */}
          <div className="relative flex-shrink-0 w-9 h-9 rounded-md bg-gradient-to-br from-cyan-900 via-ocean-800 to-ocean-950 border border-cyan-500/50 flex items-center justify-center shadow-md shadow-cyan-950/60 overflow-hidden">
            <svg
              className="w-6 h-6 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Waves */}
              <path d="M2 17c2-1 4-1 6 0s4 1 6 0 4-1 6 0" stroke="#06B6D4" strokeWidth="1.5" />
              <path d="M2 13c2-1 4-1 6 0s4 1 6 0 4-1 6 0" stroke="#00F2FE" strokeWidth="1.5" />
              {/* Location marker with sensor pulse */}
              <circle cx="12" cy="7" r="3" fill="#00F2FE" fillOpacity="0.4" stroke="#00F2FE" strokeWidth="1.5" />
              <line x1="12" y1="10" x2="12" y2="13" stroke="#38BDF8" strokeWidth="1.5" />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-mono font-bold tracking-widest text-slate-100 text-sm leading-tight">
                PRAGYA-SEA
              </span>
              <span className="font-mono text-[9px] tracking-wider text-cyan-400 font-semibold leading-tight mt-0.5">
                SEAFLOOR EXPLORATION
              </span>
              <span className="font-mono text-[7.5px] tracking-tight text-slate-500 uppercase leading-tight mt-0.5 truncate">
                LOW-COST METAL ANOMALY PLATFORM
              </span>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-ocean-800 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow hover:bg-ocean-700 hover:text-white transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isSidebarCollapsed ? (
              <div className="px-2.5 py-1 text-[10px] font-mono font-semibold tracking-widest text-slate-500 uppercase">
                {section.title}
              </div>
            ) : (
              <div className="h-[1px] bg-slate-800/80 mx-2 my-2" />
            )}

            {section.items.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md font-mono text-xs transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-ocean-800 text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-sm shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/80 border-l-2 border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold border ml-1 ${
                            item.badgeVariant === 'red'
                              ? 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                              : 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip on collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-ocean-800 text-slate-200 text-xs rounded border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity font-mono">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Mission Status Panel */}
      <div className="p-3 border-t border-slate-800/90 bg-ocean-950/60">
        {!isSidebarCollapsed ? (
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-semibold tracking-widest text-slate-500 uppercase flex items-center justify-between">
              <span>MISSION STATUS</span>
              <span className="text-[9px] text-cyan-400 font-bold">ACTIVE</span>
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  SENSOR POD
                </span>
                <span className="text-emerald-400 font-semibold">ONLINE</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  DATA LINK
                </span>
                <span className="text-cyan-300 font-semibold">LINKED</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/70 grid grid-cols-2 gap-2 text-center font-mono">
              <div className="bg-ocean-850/60 p-1.5 rounded border border-slate-800/80">
                <div className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1">
                  <BatteryCharging className="w-2.5 h-2.5 text-emerald-400" /> POWER
                </div>
                <div className="text-xs font-bold text-emerald-400">
                  {telemetry.battery}%
                </div>
              </div>
              <div className="bg-ocean-850/60 p-1.5 rounded border border-slate-800/80">
                <div className="text-[9px] text-slate-500 uppercase flex items-center justify-center gap-1">
                  <Waves className="w-2.5 h-2.5 text-cyan-400" /> DEPTH
                </div>
                <div className="text-xs font-bold text-cyan-300 truncate">
                  {Math.round(telemetry.depth).toLocaleString()} m
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-400"
              title="Sensor Online / Data Linked"
            />
            <div className="text-[10px] font-mono font-bold text-cyan-300 text-center">
              {Math.round(telemetry.depth)}m
            </div>
            <div className="text-[9px] font-mono text-emerald-400 font-semibold">
              {telemetry.battery}%
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
