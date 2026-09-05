"use client";

import { NewsItem } from "@/lib/api";
import { ExternalLink, Clock, Newspaper } from "lucide-react";

interface NewsPanelProps {
  news: NewsItem[];
  loading?: boolean;
}

export default function NewsPanel({ news, loading }: NewsPanelProps) {
  if (loading) return <NewsSkeleton />;
  if (!news || news.length === 0) return (
    <div className="glass-card p-6 text-center text-[var(--text-secondary)] text-sm">
      No recent news available.
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper size={18} className="text-[var(--accent-blue)]" />
        <h3 className="font-bold text-[var(--text-primary)]">Financials & SEC Filings</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-[rgba(79,128,255,0.15)] text-[var(--accent-blue)]">
          {news.length}
        </span>
      </div>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {news.map((item, i) => (
          <NewsCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const timeAgo = item.datetime
    ? formatTimeAgo(item.datetime * 1000)
    : "";

  return (
    <a
      href={item.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)]
        hover:border-[var(--border-hover)] hover:bg-[rgba(79,128,255,0.06)] transition-all duration-200 group"
    >
      <div className="flex gap-3">
        {item.image && (
          <div className="flex-shrink-0">
            <img
              src={item.image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-snug mb-1 group-hover:text-[var(--accent-blue)] transition-colors line-clamp-2">
            {item.headline}
            <ExternalLink size={11} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          {item.summary && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-2">
              {item.summary}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {item.source && (
              <span className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] font-medium">
                {item.source}
              </span>
            )}
            {timeAgo && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {timeAgo}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

function formatTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function NewsSkeleton() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="shimmer h-6 w-32 rounded" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
          <div className="shimmer w-16 h-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 rounded" />
            <div className="shimmer h-4 w-3/4 rounded" />
            <div className="shimmer h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
