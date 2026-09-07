"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginWithGoogle, registerWithEmail, loginWithEmail } from "@/lib/auth";
import { ShieldCheck, Sparkles, Cpu, Lock, ArrowLeft, Mail, User as UserIcon, Key, Bell } from "lucide-react";
import Link from "next/link";

type AuthMode = "login" | "signup";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTicker = searchParams.get("redirect");
  const redirectName = searchParams.get("name") || "";

  const [mode, setMode] = useState<AuthMode>("login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Beginner");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccessfulAuth = () => {
    if (redirectTicker) {
      router.push(`/?ticker=${encodeURIComponent(redirectTicker)}&name=${encodeURIComponent(redirectName)}`);
    } else {
      router.push("/");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        await registerWithEmail(name, email, password, role);
      } else {
        await loginWithEmail(email, password);
      }
      handleSuccessfulAuth();
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Failed to retrieve Google credentials.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle(credentialResponse.credential);
      handleSuccessfulAuth();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was cancelled or failed to initialize.");
  };

  return (
    <div className="w-full max-w-md bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-2xl p-8 backdrop-blur-xl shadow-2xl z-10 flex flex-col items-center">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="FinAdvisor Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-cyan-500/20 object-cover" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Fin<span className="text-[var(--accent-cyan,#00e5ff)]">Advisor</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan,#00e5ff)] border border-[rgba(0,212,255,0.3)]">
            AI PRO
          </span>
        </div>
      </div>
      <p className="text-[var(--text-secondary)] text-sm mb-6 text-center">
        AI-Powered Stock Analytics & Investment Insights
      </p>

      {/* Ticker Access Gate Notice */}
      {redirectTicker && (
        <div className="w-full mb-5 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
          <span>Please sign in to unlock full dashboard for <strong className="text-white font-mono uppercase font-bold">{redirectTicker}</strong></span>
        </div>
      )}

      {/* Tab Selector: Sign In vs Create Account */}
      <div className="w-full flex p-1 bg-[var(--card-subtle)] rounded-xl border border-[var(--border-color)] mb-6">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === "login"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === "signup"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="w-full mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
          <Lock className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Email & Password Form */}
      <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Investor Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)]"
              >
                <option value="Beginner" className="bg-slate-900">Beginner</option>
                <option value="Portfolio Pro" className="bg-slate-900">Portfolio Pro</option>
                <option value="Institutional Investor" className="bg-slate-900">Institutional Investor</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : mode === "login" ? (
            "Sign In with Email"
          ) : (
            "Create Free Account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="w-full flex items-center gap-3 my-6">
        <div className="flex-1 h-[1px] bg-[var(--border-color)]" />
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
          Or continue with
        </span>
        <div className="flex-1 h-[1px] bg-[var(--border-color)]" />
      </div>

      {/* Google OAuth Button */}
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_black"
          shape="pill"
          text="continue_with"
        />
      </div>

      {/* Security Footer Notice */}
      <div className="mt-8 flex items-center gap-1.5 text-[var(--text-secondary)] text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
        <span>Secured with 256-bit encryption & Google Cloud Identity</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-center items-center relative overflow-hidden p-4">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--card-subtle)] border border-[var(--border-color)] px-4 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <Suspense fallback={<div className="text-[var(--text-secondary)] text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
