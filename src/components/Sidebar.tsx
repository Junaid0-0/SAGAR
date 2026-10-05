import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import {
  Compass,
  Radio,
  Map as MapIcon,
  Activity,
  Target,
  Database,
  History,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'red' | 'amber' | 'teal';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    telemetry,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    targets
  } = useSimulation();

  const highPriorityTargetsCount = targets.filter(t => t.status === 'PRIORITY' || t.status === 'HIGH').length;

  // ZONE 1 & ZONE 2: Clean Section Hierarchy with Proper URL Routing Paths
  const navigationSections: NavSection[] = [
    {
      title: 'MISSION',
      items: [
        { path: '/overview', label: 'Mission Overview', icon: <Compass className="w-4 h-4" /> },
        { path: '/live-survey', label: 'Live Survey', icon: <Radio className="w-4 h-4" /> },
        { path: '/seafloor-map', label: 'Seafloor Map', icon: <MapIcon className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        {
          path: '/metal-detection',
          label: 'Metal Detection',
          icon: <Activity className="w-4 h-4" />,
          badge: telemetry.metalResponse >= telemetry.threshold ? 'ELEVATED' : undefined,
          badgeVariant: 'amber',
        },
        {
          path: '/target-zones',
          label: 'Target Zones',
          icon: <Target className="w-4 h-4" />,
          badge: `${highPriorityTargetsCount} DETECTED`,
          badgeVariant: 'red',
        },
        {
          path: '/ai-analysis',
          label: 'SAGAR AI',
          icon: <BrainCircuit className="w-4 h-4" />,
          badge: 'GEMINI',
          badgeVariant: 'teal',
        },
      ],
    },
    {
      title: 'DATA',
      items: [
        { path: '/telemetry', label: 'Telemetry & Data', icon: <Database className="w-4 h-4" /> },
        { path: '/survey-history', label: 'Survey History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/diagnostics', label: 'Sensor Diagnostics', icon: <Cpu className="w-4 h-4" /> },
        { path: '/configuration', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between h-[calc(100vh-4rem)] bg-[#FFFFFF] border-r border-[#B8CCD1] transition-all duration-200 ease-in-out z-20 select-none ${
        isSidebarCollapsed ? 'w-[64px]' : 'w-[230px]'
      }`}
    >
      {/* Top Sidebar Sub-Bar with Collapse Button */}
      <div className="p-3 border-b border-[#B8CCD1] flex items-center justify-between relative">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-[#60868C] uppercase">
              NAVIGATION
            </span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <Radio className="w-4 h-4 text-[#2A7C7A]" />
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="w-5 h-5 rounded-full bg-[#FFFFFF] border border-[#B8CCD1] text-[#60868C] flex items-center justify-center hover:bg-[#F2F6F6] hover:text-[#1F4B60] transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* ZONE 1 & 2: Navigation Menu via React Router NavLink */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 px-2 space-y-3.5">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {!isSidebarCollapsed ? (
              <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase">
                {section.title}
              </div>
            ) : (
              <div className="h-[1px] bg-[#E7E5E2] mx-2 my-2" />
            )}

            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-sans transition-colors duration-150 group relative ${
                    isActive
                      ? 'bg-[#DCEEEE] text-[#1F4B60] font-semibold border-l-[3px] border-[#2A7C7A]'
                      : 'text-[#50717B] hover:text-[#1F4B60] hover:bg-[#F2F6F6] border-l-[3px] border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex-shrink-0 ${isActive ? 'text-[#2A7C7A]' : 'text-[#60868C] group-hover:text-[#1F4B60]'}`}>
                      {item.icon}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between text-left truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded-[3px] uppercase font-semibold border ml-1 ${
                              item.badgeVariant === 'red'
                                ? 'bg-[#F9E8E8] text-[#B85C5C] border-[#CBD9DA]'
                                : item.badgeVariant === 'teal'
                                ? 'bg-[#E2EFF0] text-[#2A7C7A] border-[#BDCED3]'
                                : 'bg-[#F8EFE3] text-[#B78332] border-[#CBD9DA]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tooltip on collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1F4B60] text-[#FFFFFF] text-xs rounded-[4px] shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity font-sans">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* ZONE 3 — SYSTEM STATUS (Visually Separated Status Block) */}
      <div className="p-3 border-t border-[#B8CCD1] bg-[#F8F6F2]">
        {!isSidebarCollapsed ? (
          <div className="space-y-2">
            <div className="text-[11px] font-sans font-semibold tracking-wider text-[#60868C] uppercase flex items-center justify-between">
              <span>SYSTEM STATUS</span>
              <span className="text-[10px] text-[#3F8068] font-bold font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
                ONLINE
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-[#1F4B60]">
                <span className="text-[#60868C] font-sans text-[11px]">Sensor Pod</span>
                <span className="text-[#3F8068] font-semibold text-[11px]">ONLINE</span>
              </div>

              <div className="flex items-center justify-between text-[#1F4B60]">
                <span className="text-[#60868C] font-sans text-[11px]">Tether Link</span>
                <span className="text-[#2A7C7A] font-semibold text-[11px]">NOMINAL</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E5E2] grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#FFFFFF] p-1.5 rounded-[4px] border border-[#CBD9DA]">
                <div className="text-[9.5px] text-[#60868C] uppercase font-sans font-medium">
                  TETHER
                </div>
                <div className="text-xs font-mono font-bold text-[#3F8068] mt-0.5">
                  120 VDC
                </div>
              </div>
              <div className="bg-[#FFFFFF] p-1.5 rounded-[4px] border border-[#CBD9DA]">
                <div className="text-[9.5px] text-[#60868C] uppercase font-sans font-medium">
                  DEPTH
                </div>
                <div className="text-xs font-mono font-bold text-[#1F4B60] mt-0.5 truncate">
                  {Math.round(telemetry.depth).toLocaleString()} m
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <span
              className="w-2 h-2 rounded-full bg-[#3F8068]"
              title="Sensor Pod Online"
            />
            <div className="text-[10px] font-mono font-bold text-[#1F4B60] text-center">
              {Math.round(telemetry.depth)}m
            </div>
            <div className="text-[9px] font-mono text-[#3F8068] font-semibold">
              120V
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
