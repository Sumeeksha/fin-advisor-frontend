"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User } from "@/lib/auth";
import { Bell, Bookmark, LogOut, Clock, Sparkles, ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSelectTicker: (ticker: string, name?: string) => void;
  onGoHome?: () => void;
}

// Major financial market timezones
const TIMEZONES = [
  { label: "New York",      tz: "America/New_York",      abbr: "EST/EDT" },
  { label: "London",        tz: "Europe/London",          abbr: "GMT/BST" },
  { label: "Frankfurt",     tz: "Europe/Berlin",          abbr: "CET/CEST" },
  { label: "Dubai",         tz: "Asia/Dubai",             abbr: "GST" },
  { label: "Mumbai",        tz: "Asia/Kolkata",           abbr: "IST" },
  { label: "Singapore",     tz: "Asia/Singapore",         abbr: "SGT" },
  { label: "Tokyo",         tz: "Asia/Tokyo",             abbr: "JST" },
  { label: "Sydney",        tz: "Australia/Sydney",       abbr: "AEDT/AEST" },
  { label: "UTC",           tz: "UTC",                    abbr: "UTC" },
  { label: "Chicago",       tz: "America/Chicago",        abbr: "CST/CDT" },
  { label: "San Francisco", tz: "America/Los_Angeles",   abbr: "PST/PDT" },
  { label: "Hong Kong",     tz: "Asia/Hong_Kong",         abbr: "HKT" },
];

const STORAGE_KEY = "fa_selected_timezone";

function getLiveAbbr(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

export default function Navbar({ user, onLogout, onSelectTicker, onGoHome }: NavbarProps) {
  const [timeStr, setTimeStr] = useState("");
  const [selectedTz, setSelectedTz] = useState(TIMEZONES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Restore saved timezone from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = TIMEZONES.find((t) => t.tz === saved);
        if (found) setSelectedTz(found);
      }
    } catch { /* ignore */ }
  }, []);

  // Live clock — updates every second for the selected timezone
  useEffect(() => {
    const update = () => {
      const abbr = getLiveAbbr(selectedTz.tz);
      setTimeStr(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: selectedTz.tz,
        }) +
          " " +
          abbr
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [selectedTz]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectTz = (tz: (typeof TIMEZONES)[0]) => {
    setSelectedTz(tz);
    setDropdownOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, tz.tz);
    } catch { /* ignore */ }
  };

  return (
    <header className="sticky top-0 z-40 app-header backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-2.5">
        {/* Main top header row */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
              title="Go to Home Page"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FinAdvisor Logo"
                className="w-7 h-7 rounded-[10px] shadow-[0_4px_14px_rgba(0,115,255,0.35)] group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
                FinAdvisor
              </span>
            </button>
          </div>

          {/* Desktop Search Bar (inline on md screens and above) */}
          <div className="hidden md:block relative flex-1 max-w-md lg:max-w-xl xl:max-w-3xl mx-4">
            <SearchBar onSelect={onSelectTicker} />
          </div>

          {/* Right: Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* ── 1. Timezone Clock Dropdown (Hidden on mobile/small viewports) ── */}
            <div className="hidden md:block relative inline-block min-w-[215px]" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] font-mono hover:bg-[rgba(0,212,255,0.12)] transition-all cursor-pointer select-none whitespace-nowrap"
                title="Change timezone"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock size={13} className="shrink-0" />
                  <span className="tabular-nums tracking-tight font-mono">{timeStr || "-- : -- : -- --"}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] font-sans border-l border-[rgba(0,212,255,0.3)] pl-2">
                    {selectedTz.label}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`text-[var(--text-secondary)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+8px)] min-w-full w-full rounded-xl overflow-hidden z-[100] timezone-dropdown-panel"
                >
                  <div
                    className="px-3 py-2 border-b border-[var(--border-color)] bg-[rgba(0,212,255,0.08)] [data-theme='light']:bg-slate-50"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-cyan)]">
                      🌐 Market Timezones
                    </p>
                  </div>
                  <ul className="max-h-72 overflow-y-auto">
                    {TIMEZONES.map((tz) => {
                      const isActive = tz.tz === selectedTz.tz;
                      const liveAbbr = getLiveAbbr(tz.tz);
                      return (
                        <li key={tz.tz}>
                          <button
                            type="button"
                            onClick={() => handleSelectTz(tz)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                              isActive
                                ? "text-[var(--accent-cyan)]"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{tz.label}</span>
                            </div>
                            <span className="font-mono text-[10px] opacity-60">{liveAbbr}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Thin separator */}
            <span className="hidden md:block w-px h-5 bg-[var(--border-color)] opacity-60" />

            {/* ── 2. Watchlist (Hidden on mobile/small viewports) ── */}
            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-subtle)] border border-[var(--border-color)] transition-all cursor-pointer"
              title="Watchlist"
            >
              <Bookmark size={14} className="text-[var(--accent-cyan)]" />
              <span>Watchlist</span>
            </button>

            {/* ── 3. Notifications ── */}
            <button
              type="button"
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-subtle)] border border-[var(--border-color)] transition-all cursor-pointer relative shrink-0"
              title="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
            </button>

            {/* ── 4. Theme Toggle ── */}
            <div className="shrink-0">
              <ThemeToggle />
            </div>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link href="/profile" className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[rgba(79,128,255,0.15)] to-[rgba(0,212,255,0.15)] border border-[rgba(79,128,255,0.3)] hover:opacity-80 transition-opacity cursor-pointer">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt={user.name || "User Avatar"} className="w-5 h-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--accent-blue)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold text-[var(--text-primary)] leading-tight">{user.name || user.email}</span>
                    <span className="block text-[9px] font-semibold text-[var(--accent-cyan)] leading-tight">{user.role || "Beginner"}</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] hover:opacity-90 transition-opacity shadow-sm shrink-0 whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row (Stacked below top row on screens < md) */}
        <div className="block md:hidden mt-2.5 pt-2 border-t border-[var(--border-color)]/40 w-full">
          <SearchBar onSelect={onSelectTicker} />
        </div>
      </div>
    </header>
  );
}

