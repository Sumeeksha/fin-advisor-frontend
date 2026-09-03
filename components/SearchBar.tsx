"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, TrendingUp, X, Clock, Command } from "lucide-react";
import { api, SearchResult } from "@/lib/api";

interface SearchBarProps {
  onSelect: (ticker: string, name: string) => void;
}

const POPULAR = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
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

  // Keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
    <div className="relative w-full max-w-xl mx-auto">
      {/* Input Field matching screenshot */}
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60 group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-colors">
          <Search size={16} />
        </div>
        <input
          ref={inputRef}
          id="stock-search"
          type="text"
          value={query}
          placeholder="Search ticker, company or AI signal..."
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-12 py-2 rounded-full text-xs font-medium outline-none transition-all duration-200 search-input-field focus:border-blue-500 shadow-inner"
        />
        
        {/* Command shortcut badge ⌘K */}
        {!query && !loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded search-result-badge text-[10px] font-mono pointer-events-none shadow-sm">
            <Command size={10} />
            <span>K</span>
          </div>
        )}

        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-colors"
          >
            <X size={15} />
          </button>
        )}
        
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 search-dropdown-container rounded-2xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
        >
          {!query && recent.length > 0 && (
            <div className="px-4 py-2.5 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-2">
                <Clock size={11} /> Recent
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
            <div className="px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-2">
                <TrendingUp size={11} /> Popular
              </div>
              <div className="grid grid-cols-2 gap-1">
                {POPULAR.map((p) => (
                  <button
                    key={p.symbol}
                    onClick={() => handleSelect(p.symbol, p.name)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg search-row-hover transition-colors text-left"
                  >
                    <span className="font-mono font-bold text-xs search-result-symbol">{p.symbol}</span>
                    <span className="text-xs search-result-name truncate">{p.name}</span>
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left search-row-hover ${
        active ? "bg-blue-500/10" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-lg search-avatar-box flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold">{symbol.slice(0, 3)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-xs search-result-symbol">{symbol}</div>
        <div className="text-[11px] search-result-name truncate">{name}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        {type && <span className="text-[10px] px-2 py-0.5 rounded-full search-result-badge font-medium">{type}</span>}
        {exchange && <span className="text-[10px] opacity-60">{exchange}</span>}
      </div>
    </button>
  );
}
