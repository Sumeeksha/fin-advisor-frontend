"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("finadvisor_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "dark";
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
    return <div className="w-12 h-7 rounded-full opacity-0" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-7 w-12 px-0.5 rounded-full border transition-all duration-300 cursor-pointer outline-none shrink-0 ${
        isDark
          ? "border-slate-700 bg-slate-900 hover:border-slate-600"
          : "border-slate-300 bg-slate-200 hover:border-slate-400"
      }`}
    >
      {/* Sliding Knob with Sun / Moon Icons */}
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-sm ${
          isDark
            ? "translate-x-5 bg-slate-800 text-blue-400"
            : "translate-x-0 bg-white text-amber-500"
        }`}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </div>
    </button>
  );
}
