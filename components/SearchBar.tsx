"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, TrendingUp, X, Clock } from "lucide-react";
import { api, SearchResult } from "@/lib/api";

interface SearchBarProps {
  onSelect: (ticker: string, name: string) => void;
}

const POPULAR = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NFLX", name: "Netflix, Inc." },
];

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<{ symbol: string; name: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem("recent_searches");
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchTickers(q);
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const handleSelect = (symbol: string, name: string) => {
    setQuery("");
    setOpen(false);
    setResults([]);
    setActiveIndex(-1);

    const updated = [{ symbol, name }, ...recent.filter((r) => r.symbol !== symbol)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    onSelect(symbol, name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = query ? results : recent;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const item = list[activeIndex];
      handleSelect(item.symbol, item.name);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && (query ? results.length > 0 || loading : recent.length > 0 || POPULAR.length > 0);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Input */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-blue)] transition-colors">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          id="stock-search"
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-12 py-4 rounded-2xl text-base font-medium outline-none transition-all duration-300 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent-blue)] hover:border-[var(--border-hover)] shadow-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        )}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent-blue)] border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50 shadow-2xl slide-up"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(79,128,255,0.1)" }}
        >
          {/* Recent / Search results */}
          {!query && recent.length > 0 && (
            <div className="px-4 py-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <Clock size={12} /> Recent
              </div>
              {recent.map((r, i) => (
                <ResultRow
                  key={r.symbol}
                  symbol={r.symbol}
                  name={r.name}
                  type="Recent"
                  active={i === activeIndex}
                  onClick={() => handleSelect(r.symbol, r.name)}
                />
              ))}
            </div>
          )}

          {!query && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <TrendingUp size={12} /> Popular
              </div>
              <div className="grid grid-cols-2 gap-1">
                {POPULAR.map((p) => (
                  <button
                    key={p.symbol}
                    onClick={() => handleSelect(p.symbol, p.name)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[rgba(79,128,255,0.1)] transition-colors text-left"
                  >
                    <span className="font-mono font-bold text-sm text-[var(--accent-blue)]">{p.symbol}</span>
                    <span className="text-xs text-[var(--text-secondary)] truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.map((r, i) => (
            <ResultRow
              key={r.symbol}
              symbol={r.symbol}
              name={r.name}
              type={r.type}
              exchange={r.exchange}
              active={i === activeIndex}
              onClick={() => handleSelect(r.symbol, r.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  symbol, name, type, exchange, active, onClick
}: {
  symbol: string; name: string; type?: string; exchange?: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-[rgba(79,128,255,0.1)] ${active ? "bg-[rgba(79,128,255,0.15)]" : ""
        }`}
    >
      <div className="w-10 h-10 rounded-xl bg-[rgba(79,128,255,0.15)] flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-[var(--accent-blue)]">{symbol.slice(0, 3)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-[var(--text-primary)]">{symbol}</div>
        <div className="text-xs text-[var(--text-secondary)] truncate">{name}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {type && <span className="text-xs px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]">{type}</span>}
        {exchange && <span className="text-xs text-[var(--text-secondary)]">{exchange}</span>}
      </div>
    </button>
  );
}
