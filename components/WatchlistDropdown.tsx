"use client";

import { useState, useEffect, useRef } from "react";
import { Bookmark, Star, Trash2 } from "lucide-react";
import { api, WatchlistItem } from "@/lib/api";

interface WatchlistDropdownProps {
  onSelectTicker: (ticker: string) => void;
}

export default function WatchlistDropdown({ onSelectTicker }: WatchlistDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const data = await api.getWatchlist();
      setWatchlist(data);
    } catch (e) {
      console.error("Failed to fetch watchlist", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWatchlist();
    }
  }, [isOpen]);

  // Listen for custom event to update watchlist count
  useEffect(() => {
    const handleUpdate = () => {
      fetchWatchlist();
    };
    window.addEventListener("watchlist-updated", handleUpdate);
    return () => window.removeEventListener("watchlist-updated", handleUpdate);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRemove = async (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    try {
      await api.removeFromWatchlist(ticker);
      setWatchlist(watchlist.filter(item => item.ticker !== ticker));
      window.dispatchEvent(new Event("watchlist-updated"));
    } catch (e) {
      console.error("Failed to remove from watchlist", e);
    }
  };

  const handleSelect = (ticker: string) => {
    onSelectTicker(ticker);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card-subtle)] border border-[var(--border-color)] transition-all cursor-pointer"
        title="Watchlist"
      >
        <Bookmark size={14} className="text-[var(--accent-cyan)]" />
        <span>Watchlist {watchlist.length > 0 ? `(${watchlist.length})` : ""}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-xl overflow-hidden z-[100] timezone-dropdown-panel">
          <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[rgba(0,212,255,0.08)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-cyan)] flex items-center gap-1">
              <Star size={12} /> My Watchlist
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading && watchlist.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-secondary)]">Loading...</div>
            ) : watchlist.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-secondary)]">
                Your watchlist is empty. Add stocks to keep track of them.
              </div>
            ) : (
              <ul>
                {watchlist.map((item) => (
                  <li key={item.ticker} className="border-b border-[var(--border-color)] last:border-0">
                    <div className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-[var(--card-subtle)] cursor-pointer group" onClick={() => handleSelect(item.ticker)}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{item.ticker}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemove(e, item.ticker)}
                        className="text-[var(--text-secondary)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
