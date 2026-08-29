import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAdvisor — Real-Time Stock Analysis & AI Investment Advice",
  description:
    "AI-powered stock analysis platform with real-time quotes, technical indicators (RSI, MACD, Moving Averages), price forecasting, and Buy/Hold/Sell recommendations.",
  keywords: "stock analysis, investment advice, RSI, MACD, technical analysis, financial advisor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
