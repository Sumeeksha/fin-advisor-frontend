"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  api,
  QuoteData, OHLCVBar, IndicatorData, AdviceData, ForecastData, NewsItem, CompanyInfo,
} from "@/lib/api";

import SearchBar from "@/components/SearchBar";
import PriceCard from "@/components/PriceCard";
import StockChart from "@/components/StockChart";
import IndicatorPanel from "@/components/IndicatorPanel";
import AdvicePanel from "@/components/AdvicePanel";
import ForecastChart from "@/components/ForecastChart";
import NewsPanel from "@/components/NewsPanel";

import { RefreshCw, BarChart2, TrendingUp, Newspaper, Activity } from "lucide-react";

const REFRESH_INTERVAL = 60000; // 60 seconds

type TabId = "overview" | "indicators" | "forecast" | "news";

export default function DashboardPage() {
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

  // Loading states
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
      .then((d) => setNews(d.news))
      .catch(() => { })
      .finally(() => setLoadingNews(false));
  }, [fetchQuote]);

  // When ticker changes
  useEffect(() => {
    if (!ticker) return;
    setQuote(null);
    setHistory([]);
    setIndicators(null);
    setAdvice(null);
    setForecast(null);
    setNews([]);
    setInfo(null);
    setError(null);

    fetchAll(ticker);
    fetchHistory(ticker, period);

    // Auto-refresh quote every 60s
    clearInterval(refreshRef.current);
    refreshRef.current = setInterval(() => fetchQuote(ticker), REFRESH_INTERVAL);
    return () => clearInterval(refreshRef.current);
  }, [ticker]);

  // When period changes
  useEffect(() => {
    if (!ticker) return;
    fetchHistory(ticker, period);
  }, [period, ticker]);

  const handleSelect = (symbol: string, name: string) => {
    setTicker(symbol);
    setTickerName(name);
    setActiveTab("overview");
  };

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
    <div className="min-h-screen grid-bg">
      {/* ── Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[rgba(8,13,26,0.85)] backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          {/* Logo */}
          <button 
            onClick={() => setTicker(null)}
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-lg font-black gradient-text tracking-tight hidden sm:block">FinAdvisor</span>
          </button>

          {/* Search */}
          <div className="flex-1 min-w-[240px]">
            <SearchBar onSelect={handleSelect} />
          </div>

          {/* Refresh */}
          {ticker && (
            <button
              id="refresh-btn"
              onClick={handleRefresh}
              disabled={loadingQuote}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)]
                hover:text-[var(--text-primary)] hover:bg-[rgba(79,128,255,0.1)] transition-all duration-200 border border-[var(--border-color)]"
            >
              <RefreshCw size={14} className={loadingQuote ? "animate-spin" : ""} />
              <span className="hidden sm:block">
                {lastUpdated ? `${formatTime(lastUpdated)}` : "Refresh"}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 pb-12">
        {!ticker ? (
          <WelcomeScreen onSelect={handleSelect} />
        ) : (
          <>
            {/* Error Banner */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.3)] text-[#ff4d6d] text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Ticker header */}
            <div className="flex items-center justify-between mt-6 mb-4 flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-black text-[var(--text-primary)]">{ticker}</h1>
                <p className="text-[var(--text-secondary)] text-sm">{tickerName}</p>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] rounded-xl p-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    id={`tab-${t.id}`}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === t.id
                        ? "tab-active"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 slide-up">
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
                {/* Right: Advice */}
                <div className="space-y-4">
                  <AdvicePanel data={advice} loading={loadingAdvice && !advice} />
                </div>
              </div>
            )}

            {activeTab === "indicators" && (
              <div className="slide-up">
                <IndicatorPanel data={indicators} loading={loadingIndicators && !indicators} />
              </div>
            )}

            {activeTab === "forecast" && (
              <div className="slide-up">
                <ForecastChart data={forecast} loading={loadingForecast && !forecast} />
              </div>
            )}

            {activeTab === "news" && (
              <div className="slide-up">
                <NewsPanel news={news} loading={loadingNews && news.length === 0} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Welcome Screen ────────────────────────────
function WelcomeScreen({ onSelect }: { onSelect: (s: string, n: string) => void }) {
  const FEATURED = [
    { symbol: "AAPL", name: "Apple Inc.", change: "+0.85%" },
    { symbol: "TSLA", name: "Tesla, Inc.", change: "+2.14%" },
    { symbol: "NVDA", name: "NVIDIA Corp.", change: "+1.56%" },
    { symbol: "MSFT", name: "Microsoft", change: "+0.43%" },
    { symbol: "GOOGL", name: "Alphabet", change: "-0.28%" },
    { symbol: "AMZN", name: "Amazon", change: "+1.02%" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 text-center">
      {/* Hero */}
      <div className="mb-3">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ boxShadow: "0 0 60px rgba(79,128,255,0.4)" }}>
          <TrendingUp size={36} className="text-white" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-black mb-3 gradient-text">FinAdvisor</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
          AI-powered stock analysis with real-time quotes, technical indicators, and Buy/Hold/Sell signals.
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {["📈 Real-Time Quotes", "🤖 AI Signals", "📊 RSI · MACD · MA", "🔮 Price Forecast", "📰 Latest News"].map((f) => (
          <span key={f} className="text-sm px-3 py-1.5 rounded-full bg-[rgba(79,128,255,0.1)] border border-[rgba(79,128,255,0.2)] text-[var(--text-secondary)]">
            {f}
          </span>
        ))}
      </div>

      {/* Featured tickers */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Quick Select</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FEATURED.map((f) => (
            <button
              key={f.symbol}
              id={`quick-${f.symbol}`}
              onClick={() => onSelect(f.symbol, f.name)}
              className="glass-card p-4 text-left hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 cursor-pointer"
            >
              <div className="font-black text-[var(--accent-blue)] text-lg mono">{f.symbol}</div>
              <div className="text-xs text-[var(--text-secondary)] truncate">{f.name}</div>
              <div className={`text-sm font-bold mt-1 ${f.change.startsWith("+") ? "price-up" : "price-down"}`}>
                {f.change}
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
