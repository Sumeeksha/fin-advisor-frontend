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
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
            title="Go to Home Page"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FinAdvisor Logo" className="w-8 h-8 rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:scale-105 transition-transform object-cover" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[var(--text-primary)]">
                Fin<span className="text-[var(--accent-cyan)]">Advisor</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)]">
                AI PRO
              </span>
            </div>
          </button>
        </div>

        {/* Right: Search + Clock + Theme + User */}
        <div className="flex items-center gap-3">
          {/* ── 1. Search (wider) ── */}
          <div className="relative w-72 sm:w-80">
            <SearchBar onSelect={onSelectTicker} />
          </div>

          {/* Thin separator */}
          <span className="hidden sm:block w-px h-5 bg-[var(--border-color)] opacity-60" />

          {/* ── 2. Timezone Clock Dropdown ── */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] font-mono hover:bg-[rgba(0,212,255,0.12)] transition-all cursor-pointer select-none"
              title="Change timezone"
            >
              <Clock size={13} />
              <span className="tabular-nums tracking-tight">{timeStr || "-- : -- : -- --"}</span>
              <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] font-sans border-l border-[rgba(0,212,255,0.3)] pl-1.5">
                {selectedTz.label}
              </span>
              <ChevronDown
                size={11}
                className={`ml-0.5 text-[var(--text-secondary)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div
                className="absolute left-0 top-[calc(100%+8px)] w-56 rounded-xl border border-[rgba(0,212,255,0.2)] overflow-hidden z-50"
                style={{
                  background: "var(--card-bg)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,212,255,0.08)",
                }}
              >
                <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[rgba(0,212,255,0.05)]">
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
          <span className="hidden sm:block w-px h-5 bg-[var(--border-color)] opacity-60" />

          {/* ── 3. Watchlist ── */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-subtle)] border border-[var(--border-color)] transition-all cursor-pointer"
            title="Watchlist"
          >
            <Bookmark size={14} className="text-[var(--accent-cyan)]" />
            <span>Watchlist</span>
          </button>

          {/* ── 4. Notifications ── */}
          <button
            type="button"
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-subtle)] border border-[var(--border-color)] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
          </button>

          {/* ── 5. Theme Toggle ── */}
          <ThemeToggle />

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[rgba(79,128,255,0.15)] to-[rgba(0,212,255,0.15)] border border-[rgba(79,128,255,0.3)]">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt={user.name || "User Avatar"} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--accent-blue)] text-white text-[10px] font-bold flex items-center justify-center">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--text-primary)] leading-tight">{user.name || user.email}</span>
                  <span className="block text-[9px] font-semibold text-[var(--accent-cyan)] leading-tight">Portfolio Pro</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] hover:opacity-90 transition-opacity shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
