import type { Metadata } from "next";
import type { Viewport } from "next";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAdvisor — Real-Time Stock Analysis & AI Investment Advice",
  description:
    "AI-powered stock analysis platform with real-time quotes, technical indicators (RSI, MACD, Moving Averages), price forecasting, and Buy/Hold/Sell recommendations.",
  keywords: "stock analysis, investment advice, RSI, MACD, technical analysis, financial advisor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className="antialiased">
        <GoogleAuthProvider>{children}</GoogleAuthProvider>
      </body>
    </html>
  );
}

