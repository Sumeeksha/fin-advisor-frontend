"use client";

import { Activity, BarChart2, Cpu, FileText, PieChart, MessageSquare } from "lucide-react";

export type SubTabId =
  | "overview"
  | "indicators"
  | "forecast"
  | "chat"
  | "news"
  | "options";

interface SubHeaderProps {
  activeTab: SubTabId;
  onTabChange: (tab: SubTabId) => void;
}

const TABS: { id: SubTabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "indicators", label: "Technical Indicators", icon: BarChart2 },
  { id: "forecast", label: "AI Forecast & Valuation", icon: Cpu },
  { id: "chat", label: "AI Copilot & Simulator", icon: MessageSquare },

  { id: "news", label: "Financials & SEC Filings", icon: FileText },
  { id: "options", label: "Options Flow & Dark Pool", icon: PieChart },
];

export default function SubHeader({ activeTab, onTabChange }: SubHeaderProps) {
  return (
    <div className="bg-[var(--bg-secondary)] backdrop-blur-md border-b border-[var(--border-color)] overflow-x-auto no-scrollbar scrollbar-none transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 flex items-center justify-between gap-4">
        {/* Tab list */}
        <div className="flex items-center gap-1 sm:gap-1.5 py-1.5 w-full sm:w-auto justify-between sm:justify-start flex-nowrap overflow-x-auto no-scrollbar scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                title={tab.label}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-subtle)] border border-transparent"
                }`}
              >
                <Icon size={15} className={`shrink-0 ${isActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"}`} />
                <span className="hidden sm:inline shrink-0 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
