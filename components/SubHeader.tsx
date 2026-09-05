"use client";

import { Activity, BarChart2, Cpu, FileText, Newspaper, PieChart, MessageSquare } from "lucide-react";

export type SubTabId =
  | "overview"
  | "indicators"
  | "forecast"
  | "chat"
  | "financials"
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
  { id: "financials", label: "Financials & SEC Filings", icon: FileText },
  { id: "news", label: "News & Sentiment", icon: Newspaper },
  { id: "options", label: "Options Flow & Dark Pool", icon: PieChart },
];

export default function SubHeader({ activeTab, onTabChange }: SubHeaderProps) {
  return (
    <div className="bg-[var(--bg-secondary)] backdrop-blur-md border-b border-[var(--border-color)] overflow-x-auto transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 flex items-center justify-between gap-6">
        {/* Left: Tab list */}
        <div className="flex items-center gap-1 py-1.5 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-subtle)] border border-transparent"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: S&P 500 & NASDAQ live indices */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono font-bold text-[var(--text-secondary)] py-1.5 min-w-max">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)]">S&P 500</span>
            <span className="text-[var(--text-primary)]">5,117.09</span>
            <span className="text-[#10d98a]">+0.42%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)]">NASDAQ</span>
            <span className="text-[var(--text-primary)]">16,288.36</span>
            <span className="text-[#10d98a]">+0.85%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
