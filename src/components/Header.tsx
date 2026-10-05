import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

export const Header: React.FC = () => {
  const { telemetry } = useSimulation();

  const [timeUtc, setTimeUtc] = useState<string>('02:45:11 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getUTCHours();
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      const hours12 = rawHours % 12 || 12;
      const hoursStr = hours12.toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      setTimeUtc(`${hoursStr}:${minutes}:${seconds} ${ampm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#B8CCD1] px-6 flex items-center justify-between select-none relative z-30">
      {/* ZONE 1 — LEFT: Application Identity (Fixed, consistent across all pages) */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[6px] bg-[#E2EFF0] border border-[#CBD9DA] flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-[#2A7C7A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 17c2-1 4-1 6 0s4 1 6 0 4-1 6 0" stroke="#2A7C7A" strokeWidth="1.5" />
            <path d="M2 13c2-1 4-1 6 0s4 1 6 0 4-1 6 0" stroke="#1F4B60" strokeWidth="1.75" />
            <circle cx="12" cy="7" r="2.5" fill="#E2EFF0" stroke="#2A7C7A" strokeWidth="1.5" />
            <line x1="12" y1="9.5" x2="12" y2="12" stroke="#2A7C7A" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <h1 className="text-[16px] font-bold tracking-wider text-[#1F4B60] uppercase font-sans leading-none">
            SAGAR
          </h1>
          <p className="text-[9.5px] sm:text-[10px] text-[#60868C] font-sans mt-0.5 leading-tight tracking-tight">
            Seafloor Analysis and Geospatial Assessment for Resource Exploration
          </p>
        </div>
      </div>

      {/* ZONE 2 — CENTER: Mission Context (Compact Contextual Strip) */}
      <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-[4px] bg-[#F8F6F2] border border-[#CBD9DA] text-xs font-mono">
        <span className="font-semibold text-[#1F4B60] tracking-wide">MISSION 07</span>
        <span className="text-[#CBD9DA]">/</span>
        <span className="font-medium text-[#60868C] tracking-wide">SEAFLOOR SURVEY</span>
        <span className="text-[#CBD9DA]">/</span>
        <span className="font-bold text-[#2A7C7A] tracking-wider">{telemetry.currentLine}</span>
      </div>

      {/* ZONE 3 — RIGHT: System State (Compact Typography, No Card Clutter) */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Telemetry Linked Compact Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#E5F2EC] border border-[#CBD9DA] text-[#3F8068] text-[10.5px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068] animate-pulse" />
          <span>TELEMETRY LINKED</span>
        </div>

        {/* Simulation Mode Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#DCEEEE] border border-[#B8CCD1] text-[#2A7C7A] text-[10.5px] font-semibold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2A7C7A]" />
          <span>SIMULATION MODE</span>
        </div>

        {/* Vessel Status */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#60868C]">
          <span>RV SAMUDRA</span>
          <span className="text-[#3F8068] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3F8068]" />
            ONLINE
          </span>
        </div>

        {/* UTC Clock */}
        <div className="flex items-center gap-1.5 pl-3 border-l border-[#B8CCD1] text-[11px]">
          <span className="text-[#60868C]">UTC</span>
          <span className="font-semibold text-[#1F4B60] tracking-wider">{timeUtc}</span>
        </div>
      </div>
    </header>
  );
};
