"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  api,
  QuoteData, OHLCVBar, IndicatorData, AdviceData, ForecastData, NewsItem, CompanyInfo, InsightData
} from "@/lib/api";
import { getStoredUser, clearSession, fetchCurrentUser, User } from "@/lib/auth";

import SearchBar from "@/components/SearchBar";
import PriceCard from "@/components/PriceCard";
import StockChart from "@/components/StockChart";
import IndicatorPanel from "@/components/IndicatorPanel";
import AdvicePanel from "@/components/AdvicePanel";
import ForecastChart from "@/components/ForecastChart";
import NewsPanel from "@/components/NewsPanel";
import InsightPanel from "@/components/InsightPanel";
import ThemeToggle from "@/components/ThemeToggle";

import { RefreshCw, BarChart2, TrendingUp, Newspaper, Activity, LogOut, LogIn } from "lucide-react";

const REFRESH_INTERVAL = 60000; // 60 seconds

type TabId = "overview" | "indicators" | "forecast" | "news";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ticker, setTicker] = useState<string | null>(null);
  const [tickerName, setTickerName] = useState("");
  const [period, setPeriod] = useState("3M");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Data states
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [history, setHistory] = useState<OHLCVBar[]>([]);
  const [indicators, setIndicators] = useState<IndicatorData | null>(null);
  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [insight, setInsight] = useState<InsightData | null>(null);

  // Loading states
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setTicker(null);
  };

  const fetchQuote = useCallback(async (t: string) => {
    setLoadingQuote(true);
    try {
      const data = await api.getQuote(t);
      setQuote(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch quote");
    } finally {
      setLoadingQuote(false);
    }
  }, []);

  const fetchHistory = useCallback(async (t: string, p: string) => {
    setLoadingHistory(true);
    try {
      const data = await api.getHistory(t, p);
      setHistory(data.data);
    } catch { /* silent */ } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchAll = useCallback(async (t: string) => {
    setLoadingIndicators(true);
    setLoadingAdvice(true);
    setLoadingForecast(true);
    setLoadingNews(true);
    setLoadingInsight(true);

    fetchQuote(t);

    api.getCompanyInfo(t).then(setInfo).catch(() => { });

    api.getIndicators(t)
      .then(setIndicators)
      .catch(() => { })
      .finally(() => setLoadingIndicators(false));

    api.getAdvice(t)
      .then(setAdvice)
      .catch(() => { })
      .finally(() => setLoadingAdvice(false));

    api.getForecast(t)
      .then(setForecast)
      .catch(() => { })
      .finally(() => setLoadingForecast(false));

    api.getNews(t)
      .then((res) => setNews(res.news))
      .catch(() => { })
      .finally(() => setLoadingNews(false));

    api.getInsight(t)
      .then(setInsight)
      .catch(() => { })
      .finally(() => setLoadingInsight(false));
  }, [fetchQuote]);

  const handleSelect = useCallback((symbol: string, name: string) => {
    // Gate: Check if user is logged in
    const currentUser = getStoredUser();
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name || symbol)}`);
      return;
    }

    setTicker(symbol);
    setTickerName(name);
    setQuote(null);
    setInfo(null);
    setHistory([]);
    setIndicators(null);
    setAdvice(null);
    setForecast(null);
    setNews([]);
    setInsight(null);
    setError(null);
    fetchAll(symbol);
    fetchHistory(symbol, period);
  }, [fetchAll, fetchHistory, period, router]);

  // Load user and handle return from login with intended ticker
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });

    // Check if arriving from login with an intended ticker
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const initialTicker = params.get("ticker");
      const initialName = params.get("name") || initialTicker || "";
      if (initialTicker) {
        window.history.replaceState({}, "", window.location.pathname);
        if (storedUser) {
          handleSelect(initialTicker, initialName);
        }
      }
    }
  }, [handleSelect]);

  useEffect(() => {
    if (!ticker) return;
    fetchHistory(ticker, period);
  }, [period, ticker, fetchHistory]);

  useEffect(() => {
    if (!ticker) return;
    refreshRef.current = setInterval(() => {
      fetchQuote(ticker);
    }, REFRESH_INTERVAL);
    return () => clearInterval(refreshRef.current);
  }, [ticker, fetchQuote]);

  const handleRefresh = () => {
    if (ticker) {
      fetchAll(ticker);
      fetchHistory(ticker, period);
    }
  };

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={15} /> },
    { id: "indicators", label: "Indicators", icon: <Activity size={15} /> },
    { id: "forecast", label: "Forecast", icon: <TrendingUp size={15} /> },
    { id: "news", label: "News", icon: <Newspaper size={15} /> },
  ];

  return (
    <div className="min-h-screen grid-bg flex flex-col justify-between">
      <div>
        {/* ── Top Header ────────────────────────── */}
        <header className="sticky top-0 z-40 app-header backdrop-blur-xl transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
            {/* Main Bar: Logo on left, Controls on right, Search in middle on desktop */}
            <div className="flex items-center justify-between gap-3">

              {/* 1. Logo & Market Status Badge */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setTicker(null)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="w-7 h-7 rounded-lg app-logo-icon flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-black app-logo-text tracking-tight">FinAdvisor</span>
                </button>

                {/* Ticker status badge (Desktop only) */}
                <div className="hidden lg:flex items-center gap-2 text-xs market-status-badge px-3 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse" />
                  <span className="font-semibold">US Markets Open</span>
                  <span className="opacity-40">|</span>
                  <span className="font-mono">SPY <span className="text-emerald-500 font-semibold">+0.64%</span></span>
                  <span className="font-mono">QQQ <span className="text-emerald-500 font-semibold">+1.12%</span></span>
                </div>
              </div>

              {/* 2. Desktop Search Bar (Hidden on mobile <sm, centered on sm+) */}
              <div className="hidden sm:block flex-1 min-w-[200px] max-w-xl mx-3">
                <SearchBar onSelect={handleSelect} />
              </div>

              {/* 3. Right Controls: Refresh + ThemeToggle + User Profile */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {ticker && (
                  <button
                    id="refresh-btn"
                    onClick={handleRefresh}
                    disabled={loadingQuote}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium market-status-badge transition-all"
                    title="Refresh data"
                  >
                    <RefreshCw size={13} className={loadingQuote ? "animate-spin" : ""} />
                    <span className="hidden md:block">
                      {lastUpdated ? `${formatTime(lastUpdated)}` : "Refresh"}
                    </span>
                  </button>
                )}

                <ThemeToggle />

                {/* User Auth Control Pill */}
                {user ? (
                  <div className="flex items-center gap-2 market-status-badge px-2.5 sm:px-3 py-1 rounded-xl">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "User Avatar"}
                        className="w-5 h-5 rounded-full ring-2 ring-blue-500 shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="text-xs font-medium max-w-[90px] truncate hidden md:inline">
                      {user.name || user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      title="Sign Out"
                      className="opacity-70 hover:opacity-100 hover:text-rose-400 p-0.5 transition-colors"
                    >
                      <LogOut size={13} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <LogIn size={14} />
                    <span className="hidden xs:inline">Sign In</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Search Bar (Full-width clean row directly under logo and controls on mobile <sm) */}
            <div className="block sm:hidden mt-2 pt-1 border-t border-black/5 dark:border-white/5">
              <SearchBar onSelect={handleSelect} />
            </div>
          </div>
        </header>

        {/* ── Main Workspace ───────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 pb-12">
          {!ticker ? (
            <WelcomeScreen onSelect={handleSelect} />
          ) : (
            <>
              {/* Error Banner */}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Ticker header */}
              <div className="flex items-center justify-between mt-6 mb-4 flex-wrap gap-2">
                <div>
                  <h1 className="text-2xl font-black">{ticker}</h1>
                  <p className="opacity-70 text-sm">{tickerName}</p>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 market-status-badge rounded-xl p-1">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      id={`tab-${t.id}`}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === t.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "opacity-70 hover:opacity-100"
                        }`}
                    >
                      {t.icon}
                      <span className="hidden sm:block">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab panels */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Price + Chart */}
                  <div className="lg:col-span-2 space-y-4">
                    <PriceCard quote={quote!} info={info} loading={loadingQuote && !quote} />
                    <StockChart
                      data={history}
                      period={period}
                      onPeriodChange={setPeriod}
                      loading={loadingHistory && history.length === 0}
                      ticker={ticker}
                    />
                  </div>
                  {/* Right: Advice & Insight */}
                  <div className="space-y-4">
                    <AdvicePanel data={advice} loading={loadingAdvice && !advice} />
                    <InsightPanel data={insight} loading={loadingInsight && !insight} />
                  </div>
                </div>
              )}

              {activeTab === "indicators" && (
                <div>
                  <IndicatorPanel data={indicators} loading={loadingIndicators && !indicators} />
                </div>
              )}

              {activeTab === "forecast" && (
                <div>
                  <ForecastChart data={forecast} loading={loadingForecast && !forecast} />
                </div>
              )}

              {activeTab === "news" && (
                <div>
                  <NewsPanel news={news} loading={loadingNews && news.length === 0} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Footer ─────────────────────── */}
      <footer className="app-footer py-4 px-6 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            © 2026 FinAdvisor Technologies Inc. &nbsp;·&nbsp; Data Disclaimer &nbsp;·&nbsp; Privacy
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse" />
            <span className="font-medium">WebSocket Feed: 42ms latency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Hero / Welcome Screen ────────────
function WelcomeScreen({ onSelect }: { onSelect: (s: string, n: string) => void }) {
  const FEATURED = [
    { symbol: "AAPL", name: "Apple Inc.", price: "$189.84", change: "+0.85%", isUp: true },
    { symbol: "TSLA", name: "Tesla, Inc.", price: "$248.50", change: "+2.14%", isUp: true },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "$128.92", change: "+1.56%", isUp: true },
    { symbol: "MSFT", name: "Microsoft", price: "$449.78", change: "+0.43%", isUp: true },
    { symbol: "GOOGL", name: "Alphabet", price: "$177.30", change: "-0.28%", isUp: false },
    { symbol: "AMZN", name: "Amazon", price: "$186.40", change: "+1.02%", isUp: true },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8 px-4 text-center">
      {/* Central Glowing Icon Box */}
      <div className="mb-4">
        <div className="w-16 h-16 rounded-2xl cyan-neon-box flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={32} className="text-white" />
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl font-black mb-4 glow-title tracking-tight">
          FinAdvisor
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg hero-subtitle max-w-xl mx-auto leading-relaxed font-normal">
          AI-powered stock analysis with real-time quotes, technical indicators, and Buy/Hold/Sell signals.
        </p>
      </div>

      {/* Feature Badges Row */}
      <div className="flex flex-wrap justify-center gap-2.5 my-6">
        {[
          { label: "Real-Time Quotes", icon: "📈" },
          { label: "AI Signals", icon: "🤖" },
          { label: "RSI · MACD · MA", icon: "🚦" },
          { label: "Price Forecast", icon: "🔮" },
          { label: "Latest News", icon: "📰" },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full feature-pill font-semibold transition-colors"
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Select Section */}
      <div className="w-full max-w-4xl mt-4">
        <p className="text-xs font-semibold opacity-60 uppercase tracking-[0.2em] mb-6">
          QUICK SELECT
        </p>

        {/* 6 Quick Select Cards Grid (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED.map((f) => (
            <button
              key={f.symbol}
              id={`quick-${f.symbol}`}
              onClick={() => onSelect(f.symbol, f.name)}
              className="quick-card rounded-xl p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[100px] group"
            >
              <div>
                <div className="font-mono font-bold quick-card-symbol text-lg group-hover:text-blue-500 transition-colors">
                  {f.symbol}
                </div>
                <div className="text-xs quick-card-name font-normal truncate mt-0.5">
                  {f.name}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/10 dark:border-white/10">
                <span className="font-bold quick-card-price text-base font-mono">
                  {f.price}
                </span>
                <span
                  className={`text-xs font-semibold font-mono ${f.isUp ? "quick-badge-up" : "quick-badge-down"
                    }`}
                >
                  {f.change}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
