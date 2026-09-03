"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("finadvisor_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "dark"; // default to dark
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
    setMounted(true);
  }, []);

  const applyTheme = (newTheme: "dark" | "light") => {
    const root = document.documentElement;
    if (newTheme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
      root.classList.remove("light");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("finadvisor_theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    // Avoid hydration mismatch
    return (
      <div className="flex flex-col items-center justify-center gap-1 opacity-0 w-[68px]">
        <div className="w-14 h-7 rounded-full border-2 border-white/40 bg-black/40" />
        <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
          DARK MODE
        </span>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col items-center justify-center gap-1 select-none">
      <button
        id="theme-toggle-btn"
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        onClick={toggleTheme}
        className={`group relative flex items-center h-8 w-16 px-1 rounded-full border-2 transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50 ${
          isDark
            ? "border-white/80 bg-black/70 hover:border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            : "border-slate-800/80 bg-slate-100 hover:border-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
        }`}
      >
        {/* Sliding Knob */}
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-md ${
            isDark
              ? "translate-x-7 bg-white text-black"
              : "translate-x-0 bg-slate-900 text-white"
          }`}
        >
          {/* Half-light / Half-dark Sun Mode Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 8 Radial Sun Rays */}
            <line x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="12" y1="19.5" x2="12" y2="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="19.5" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />

            {/* Sun Body Outer Ring */}
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />

            {/* Split Half Fill (right half) */}
            <path d="M 12 7 A 5 5 0 0 1 12 17 Z" fill="currentColor" />
          </svg>
        </div>
      </button>

      {/* Label Text below toggle matching reference image */}
      <span
        onClick={toggleTheme}
        className="text-[9px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase cursor-pointer hover:text-[var(--text-primary)] transition-colors"
      >
        {isDark ? "DARK MODE" : "LIGHT MODE"}
      </span>
    </div>
  );
}
