"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  QuoteData, OHLCVBar, IndicatorData, AdviceData, ForecastData, NewsItem, CompanyInfo, InsightData
} from "@/lib/api";
import { getStoredUser, clearSession, fetchCurrentUser, User } from "@/lib/auth";

import Navbar from "@/components/Navbar";
import SubHeader, { SubTabId } from "@/components/SubHeader";
import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import StockHeaderBanner from "@/components/StockHeaderBanner";
import AIHybridPipelineBanner from "@/components/AIHybridPipelineBanner";
import QuantitativeVsLLMPanel from "@/components/QuantitativeVsLLMPanel";
import MultiFactorSignalStrip from "@/components/MultiFactorSignalStrip";
import StockChart from "@/components/StockChart";
import Footer from "@/components/Footer";

import IndicatorPanel from "@/components/IndicatorPanel";
import AdvicePanel from "@/components/AdvicePanel";
import ForecastChart from "@/components/ForecastChart";
import NewsPanel from "@/components/NewsPanel";

import { TrendingUp, Cpu, Activity, Sparkles } from "lucide-react";

const REFRESH_INTERVAL = 60000; // 60 seconds

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Home Page by default (ticker is null until selected)
  const [ticker, setTicker] = useState<string | null>(null);
  const [tickerName, setTickerName] = useState("");
  const [period, setPeriod] = useState("3M");
  const [activeTab, setActiveTab] = useState<SubTabId>("overview");
  const [selectedModel, setSelectedModel] = useState<"dual" | "gpt4o" | "gemini">("dual");

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

  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const handleLogout = () => {
    clearSession();
    try {
      localStorage.removeItem("fa_active_ticker");
      localStorage.removeItem("fa_active_ticker_name");
      const url = new URL(window.location.href);
      url.searchParams.delete("ticker");
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.toString());
    } catch { /* ignore */ }
    setUser(null);
    setTicker(null);
  };

  const handleGoHome = () => {
    try {
      localStorage.removeItem("fa_active_ticker");
      localStorage.removeItem("fa_active_ticker_name");
      const url = new URL(window.location.href);
      url.searchParams.delete("ticker");
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.pathname);
    } catch { /* ignore */ }
    setTicker(null);
  };

  const fetchQuote = useCallback(async (t: string) => {
    setLoadingQuote(true);
    try {
      const data = await api.getQuote(t);
      setQuote(data);
      setError(null);
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

  const fetchInsightData = useCallback(async (t: string, m: "dual" | "gpt4o" | "gemini") => {
    setLoadingInsight(true);
    try {
      const data = await api.getInsight(t, "Moderate", m);
      setInsight(data);
    } catch { /* silent */ } finally {
      setLoadingInsight(false);
    }
  }, []);

  const fetchAll = useCallback(async (t: string, m: "dual" | "gpt4o" | "gemini" = selectedModel) => {
    setLoadingIndicators(true);
    setLoadingAdvice(true);
    setLoadingForecast(true);
    setLoadingNews(true);

    fetchQuote(t);
    fetchInsightData(t, m);

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
  }, [fetchQuote, fetchInsightData, selectedModel]);

  const handleSelectTicker = useCallback((symbol: string, name?: string) => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name || symbol)}`);
      return;
    }

    setTicker(symbol);
    const resolvedName = name || symbol;
    setTickerName(resolvedName);
    setQuote(null);
    setInfo(null);
    setHistory([]);
    setIndicators(null);
    setAdvice(null);
    setForecast(null);
    setNews([]);
    setInsight(null);
    setError(null);

    // Persist active ticker to localStorage and URL
    try {
      localStorage.setItem("fa_active_ticker", symbol);
      localStorage.setItem("fa_active_ticker_name", resolvedName);
      const url = new URL(window.location.href);
      url.searchParams.set("ticker", symbol);
      url.searchParams.set("name", resolvedName);
      window.history.replaceState({}, "", url.toString());
    } catch { /* ignore */ }

    fetchAll(symbol, selectedModel);
    fetchHistory(symbol, period);
  }, [fetchAll, fetchHistory, period, router, selectedModel]);

  // Handle Model change
  const handleModelChange = (m: "dual" | "gpt4o" | "gemini") => {
    setSelectedModel(m);
    if (ticker) {
      fetchInsightData(ticker, m);
    }
  };

  // Load user session & restore active ticker on reload
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTicker = params.get("ticker");
      const urlName = params.get("name") || urlTicker || "";
      const savedTicker = localStorage.getItem("fa_active_ticker");
      const savedName = localStorage.getItem("fa_active_ticker_name") || savedTicker || "";

      const targetTicker = urlTicker || savedTicker;
      const targetName = urlName || savedName || targetTicker || "";

      if (targetTicker) {
        // Keep or sync URL
        const url = new URL(window.location.href);
        url.searchParams.set("ticker", targetTicker);
        if (targetName) url.searchParams.set("name", targetName);
        window.history.replaceState({}, "", url.toString());

        if (storedUser) {
          handleSelectTicker(targetTicker, targetName);
        }
      }
    }
  }, [handleSelectTicker]);

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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-[var(--accent-cyan)] selection:text-slate-950">
      <div>
        {/* ── Top Navigation Header ── */}
        <Navbar
          user={user}
          onLogout={handleLogout}
          onSelectTicker={handleSelectTicker}
          onGoHome={handleGoHome}
        />

        {/* ── Sub Navigation Header (Shown when viewing ticker) ── */}
        {ticker && <SubHeader activeTab={activeTab} onTabChange={setActiveTab} />}

        {/* ── Main Container ── */}
        <main className="max-w-[1700px] mx-auto px-4 py-6">
          {!ticker ? (
            /* Home Page Welcome Screen matching original design */
            <WelcomeScreen onSelect={handleSelectTicker} />
          ) : (
            /* Ticker Dashboard View */
            <>
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
                  ⚠️ {error}
                </div>
              )}

              {/* 1. Ticker Breadcrumbs & Quick Actions */}
              <BreadcrumbHeader ticker={ticker} quote={quote} info={info} />

              {/* 2. Stock Header & 8 Key Statistics Banner */}
              <StockHeaderBanner ticker={ticker} quote={quote} info={info} />

              {activeTab === "overview" && (
                <>
                  {/* 3. AI Hybrid Pipeline Architecture Diagram */}
                  <AIHybridPipelineBanner stages={insight?.pipeline_stages} />

                  {/* 4. Quantitative vs Multi-LLM Analytical Panel with Model Selector */}
                  <QuantitativeVsLLMPanel
                    insight={insight}
                    forecast={forecast}
                    selectedModel={selectedModel}
                    onSelectModel={handleModelChange}
                  />

                  {/* 5. Ingested Multi-Factor Evidence Signals Strip & Prompt Simulator */}
                  <MultiFactorSignalStrip indicators={indicators} ticker={ticker} />

                  {/* 6. Advanced Charting Canvas with Volume & Technical Averages */}
                  <StockChart
                    data={history}
                    period={period}
                    onPeriodChange={setPeriod}
                    loading={loadingHistory && history.length === 0}
                    ticker={ticker}
                    forecast={forecast}
                    indicators={indicators}
                  />
                </>
              )}

              {activeTab === "indicators" && (
                <div className="space-y-6">
                  {/* Price Forecast Projections Graph */}
                  <ForecastChart data={forecast} loading={loadingForecast && !forecast} />

                  {/* Technical Indicators Panel */}
                  <IndicatorPanel data={indicators} loading={loadingIndicators && !indicators} />
                </div>
              )}

              {activeTab === "forecast" && (
                <div className="space-y-6">
                  {/* Candlestick Chart with Live Forecast Cone & Overlay */}
                  <StockChart
                    data={history}
                    period={period}
                    onPeriodChange={setPeriod}
                    loading={loadingHistory && history.length === 0}
                    ticker={ticker}
                    forecast={forecast}
                    indicators={indicators}
                  />
                </div>
              )}

              {activeTab === "news" && (
                <div>
                  <NewsPanel news={news} loading={loadingNews && news.length === 0} />
                </div>
              )}

              {activeTab === "financials" && (
                <div className="glass-card p-6 text-center py-12">
                  <Cpu size={32} className="mx-auto text-[var(--accent-cyan)] mb-3" />
                  <h3 className="text-lg font-bold">SEC 10-K & 10-Q Financial Filings Feed</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Real-time automated SEC EDGAR parsing enabled for {ticker}.
                  </p>
                </div>
              )}

              {activeTab === "options" && (
                <div className="glass-card p-6 text-center py-12">
                  <Activity size={32} className="mx-auto text-[var(--accent-blue)] mb-3" />
                  <h3 className="text-lg font-bold">Options Flow & Dark Pool Volume Stream</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Institutional block trade tracking active for {ticker}.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Institutional Footer ── */}
      <Footer />
    </div>
  );
}

// ── Home Page / Welcome Screen Component (Matching Original Design) ──
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] py-12 px-4 text-center">
      {/* Central Glowing Icon Box & Title */}
      <div className="mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="FinAdvisor Logo"
          className="w-20 h-20 rounded-[22px] shadow-[0_12px_36px_rgba(0,115,255,0.42)] mx-auto mb-6 transition-transform hover:scale-105"
        />

        {/* Main Title matching reference screenshot */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0073ff]">
            FinAdvisor
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed font-normal">
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
            className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)]"
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Select Section */}
      <div className="w-full max-w-4xl mt-6">
        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-6">
          QUICK SELECT
        </p>

        {/* 6 Quick Select Cards Grid (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED.map((f) => (
            <button
              key={f.symbol}
              id={`quick-${f.symbol}`}
              type="button"
              onClick={() => onSelect(f.symbol, f.name)}
              className="glass-card p-5 text-left hover:border-[var(--accent-cyan)] transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] group rounded-2xl"
            >
              <div>
                <div className="font-mono font-bold text-lg text-[var(--accent-cyan)] group-hover:text-white transition-colors">
                  {f.symbol}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-normal truncate mt-0.5">
                  {f.name}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-color)]">
                <span className="font-bold text-base font-mono text-[var(--text-primary)]">
                  {f.price}
                </span>
                <span
                  className={`text-xs font-semibold font-mono px-2 py-0.5 rounded ${
                    f.isUp
                      ? "bg-[rgba(16,217,138,0.15)] text-[#10d98a]"
                      : "bg-[rgba(255,77,109,0.15)] text-[#ff4d6d]"
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
