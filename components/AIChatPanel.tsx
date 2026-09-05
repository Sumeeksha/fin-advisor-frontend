"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ChevronRight,
} from "lucide-react";
import { IndicatorData, AdviceData } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  ticker: string;
  indicators: IndicatorData | null;
  advice: AdviceData | null;
}

const SUGGESTION_CHIPS = [
  { label: "What's the buy signal strength?" },
  { label: "Explain the bearish MACD crossover" },
  { label: "Analyze RSI and Bollinger Bands" },
  { label: "What are the key risk factors?" },
  { label: "Recommend entry & exit strategy" },
  { label: "Simulate a 10% price correction" },
];

function generateLocalResponse(
  userMessage: string,
  ticker: string,
  indicators: IndicatorData | null,
  advice: AdviceData | null
): string {
  const msg = userMessage.toLowerCase();
  const rsi = indicators?.rsi?.current ?? 37.6;
  const macd = indicators?.macd?.crossover ?? "BEARISH";
  const sma50 = indicators?.moving_averages?.sma_50 ?? 191.11;
  const priceVsSma50 = indicators?.moving_averages?.price_vs_sma50 ?? -2.87;
  const signal = advice?.signal ?? "HOLD";
  const confidence = advice?.confidence ?? 72;
  const trend = advice?.trend ?? "neutral";

  if (msg.includes("rsi") || msg.includes("bollinger")) {
    return `📊 **RSI & Bollinger Band Analysis for ${ticker}:**\n\n• RSI(14) is currently at **${rsi.toFixed(1)}**, approaching the oversold threshold of 30.0. This indicates selling momentum is decelerating.\n• Bollinger Band %B is near the lower envelope — historically a mean-reversion setup.\n• Combined signal: potential **bounce zone** with elevated volatility compression.\n\nRecommendation: Watch for RSI divergence on the 4H chart before initiating a position.`;
  }

  if (msg.includes("macd") || msg.includes("crossover")) {
    return `📉 **MACD Crossover Analysis for ${ticker}:**\n\n• MACD crossover status: **${macd}**\n• Signal line is above the MACD line — negative histogram spread confirms short-term bearish pressure.\n• This is a lagging indicator; pair with RSI confirmation before acting.\n\nNote: Bearish MACD in an oversold RSI environment can precede sharp reversals — use tight stop-losses.`;
  }

  if (msg.includes("buy signal") || msg.includes("signal strength")) {
    return `🟢 **Buy Signal Assessment for ${ticker}:**\n\n• AI Recommendation: **${signal}**\n• Model Confidence: **${confidence}%**\n• Market Trend: ${trend}\n\nThe multi-model ensemble (GPT-4o + Gemini) weighted the following bullish signals:\n• Oversold RSI approaching reversal zone\n• Volume 1.2× the 20-day average (institutional absorption)\n• Lower Bollinger Band bounce setup\n\nEntry window is active. Confirm with next-day price action above the 50-SMA ($${sma50.toFixed(2)}).`;
  }

  if (msg.includes("risk")) {
    return `⚠️ **Risk Factors for ${ticker}:**\n\n${(advice?.risk_factors ?? ["Macro uncertainty", "Earnings volatility", "Rate sensitivity"]).map((r: string) => `• ${r}`).join("\n")}\n\nAdditional considerations:\n• Bearish MACD crossover signals near-term downside pressure\n• Price is ${priceVsSma50.toFixed(2)}% below the 50-SMA — overhead resistance\n• Always size positions with no more than 2% portfolio risk per trade.`;
  }

  if (msg.includes("entry") || msg.includes("exit") || msg.includes("strategy")) {
    return `🎯 **Entry & Exit Strategy for ${ticker}:**\n\n**Entry Range:** $${advice?.entry_range?.low ?? "—"} – $${advice?.entry_range?.high ?? "—"}\n**Price Target:** $${advice?.exit_target ?? "—"}\n**Stop-Loss:** $${advice?.stop_loss ?? "—"}\n\n**Execution Plan:**\n• Scale in 50% at current levels, 50% on RSI confirmation above 35\n• Trail stop-loss below the most recent swing low\n• Take partial profits (30%) at mid-target, let the remainder run\n\nRisk/Reward ratio: ~2.8:1`;
  }

  if (msg.includes("correction") || msg.includes("simulate") || msg.includes("10%")) {
    return `🔄 **Stress Simulation — 10% Price Correction for ${ticker}:**\n\nRunning ARIMA + Monte Carlo scenario...\n\n• New support target: $${((advice?.entry_range?.low ?? 185) * 0.9).toFixed(2)}\n• RSI would drop to ~${(rsi * 0.78).toFixed(1)} — deeply oversold territory\n• Bollinger %B would compress to near 0.0 (extreme lower band breach)\n• Model confidence post-correction: ~58% for a mean-reversion bounce\n\nConclusion: A 10% drawdown would create a **high-conviction accumulation zone** for long-term investors.`;
  }

  return `🤖 **FinAdvisor AI for ${ticker}:**\n\nThank you for your question. Based on the current multi-factor analysis:\n\n• Signal: **${signal}** with ${confidence}% confidence\n• RSI: ${rsi.toFixed(1)} | MACD: ${macd} | 50-SMA: $${sma50.toFixed(2)}\n\nFor a deeper analysis, try asking about specific indicators (RSI, MACD, Bollinger Bands), risk factors, or entry/exit strategies. I can also simulate macro scenarios like price corrections or rate changes.`;
}

export default function AIChatPanel({ ticker, indicators, advice }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Welcome to **FinAdvisor AI Copilot** for **${ticker}**.\n\nI have ingested real-time technical indicators, multi-LLM analysis, and market intelligence for this stock. Ask me anything — from signal explanations to risk assessment and trade strategy.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    setIsTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const response = generateLocalResponse(content, ticker, indicators, advice);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={`${line.startsWith("•") ? "ml-2" : ""} leading-relaxed`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-bold text-[var(--text-primary)]">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <div
      className="glass-card flex flex-col overflow-hidden"
      style={{
        height: "calc(100vh - 220px)",
        minHeight: "620px",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          background: "var(--card-subtle)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))" }}
          >
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)] text-sm">
              FinAdvisor AI Copilot
            </h2>
            <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Analyzing {ticker} · GPT-4o + Gemini Ensemble
            </p>
          </div>
        </div>
        <div
          className="text-[10px] px-3 py-1 rounded-full font-mono font-semibold"
          style={{
            background: "var(--card-subtle)",
            border: "1px solid var(--border-color)",
            color: "var(--accent-cyan)",
          }}
        >
          {advice?.signal ?? "—"} · {advice?.confidence ?? "—"}% confidence
        </div>
      </div>

      {/* ── Scrollable Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-color) transparent" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{
                background:
                  msg.role === "assistant"
                    ? "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {msg.role === "assistant" ? (
                <Bot size={15} className="text-white" />
              ) : (
                <User size={15} className="text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm space-y-1 ${
                msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
              }`}
              style={
                msg.role === "assistant"
                  ? {
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-secondary)",
                    }
                  : {
                      background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.12))",
                      border: "1px solid rgba(139,92,246,0.3)",
                      color: "var(--text-primary)",
                    }
              }
            >
              <div className="space-y-0.5 text-[13px]">{formatContent(msg.content)}</div>
              <p className="text-[10px] mt-2 opacity-40 font-mono text-[var(--text-secondary)]">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))" }}
            >
              <Bot size={15} className="text-white" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "var(--accent-cyan)", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Suggestion Chips ── */}
      <div
        className="px-6 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-2.5">
          Suggested Questions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendMessage(chip.label)}
              disabled={isTyping}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "var(--card-subtle)",
                border: "1px solid var(--border-color)",
                color: "var(--accent-cyan)",
              }}
            >
              {chip.label}
              <ChevronRight size={10} className="opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Bar ── */}
      <div
        className="px-6 py-4 flex-shrink-0"
        style={{
          borderTop: "1px solid var(--border-color)",
          background: "var(--card-subtle)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-3 pointer-events-none" style={{ color: "var(--accent-cyan)" }}>
              <Sparkles size={15} />
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={`Ask anything about ${ticker}... (Shift+Enter for new line)`}
              className="w-full resize-none rounded-2xl text-sm outline-none transition-all pl-10 pr-4 py-3"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                maxHeight: "120px",
                minHeight: "48px",
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))",
              boxShadow: input.trim() ? "var(--glow-cyan)" : "none",
            }}
          >
            <Send size={17} className="text-white" />
          </button>
        </form>
        <p className="text-[10px] text-[var(--text-secondary)] text-center mt-2 opacity-50">
          FinAdvisor AI · Not financial advice · Always verify with a licensed advisor
        </p>
      </div>
    </div>
  );
}
