"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, clearSession, fetchCurrentUser, User, updateProfile } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User as UserIcon, Lock, ShieldCheck, AlertCircle, Copy, Calendar, Eye, EyeOff, Info } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [role, setRole] = useState("Beginner");

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    setRole(storedUser.role || "Beginner");
    fetchCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        setRole(u.role || "Beginner");
      }
    });
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleSelectTicker = (symbol: string, name?: string) => {
    router.push(`/?ticker=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name || symbol)}`);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    try {
      const response = await updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setUser(response.user);
      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update password." });
    }
  };

  const handleRoleUpdate = async () => {
    setMessage(null);
    try {
      const response = await updateProfile({ role });
      setUser(response.user);
      setMessage({ type: "success", text: "Role updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update role." });
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-200 selection:text-slate-900">
      <div>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onSelectTicker={handleSelectTicker}
          onGoHome={handleGoHome}
        />

        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 w-full flex-1">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your personal account details, role, and security settings.</p>
            </div>

            {/* Mock Tabs */}
            {/* <div className="flex bg-slate-100 p-1 rounded-full w-fit border border-slate-200">
              <button className="px-5 py-2 text-xs font-bold text-slate-900 bg-white rounded-full shadow-sm">
                General & Security
              </button>
              <button className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700">
                Preferences
              </button>
            </div> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* User Details Card */}
            <div className="md:col-span-4 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col items-center">
              <div className="relative mb-6">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#d97706] text-white text-5xl font-bold flex items-center justify-center shadow-sm">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-blue-500 p-1.5 rounded-full text-white border-4 border-white" title="Verified Account">
                  <ShieldCheck size={18} className="fill-blue-500 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.name || "User"}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 cursor-pointer hover:text-slate-700">
                <span>{user.email}</span>
                <Copy size={14} />
              </div>

              <div className="w-full flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trading Role</span>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Portfolio Pro">Portfolio Pro</option>
                      <option value="Institutional Investor">Institutional Investor</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRoleUpdate}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  Determines dashboard insights & default risk alerts.
                </p>

                <hr className="w-full border-slate-100 my-6" />

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={16} />
                    <span className="text-xs font-medium">Member Since</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "7 September 2026"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security / Password Update Card */}
            <div className="md:col-span-8 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-blue-600 shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Change Password</h2>
                  <p className="text-sm text-slate-500">Ensure your account is protected using a strong, unique pass-phrase.</p>
                </div>
              </div>

              <hr className="border-slate-100 mb-8" />

              {message && (
                <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 text-sm font-semibold ${message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative mb-2">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Fake Password Strength Indicator */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex gap-1 h-1.5">
                        <div className="flex-1 bg-emerald-500 rounded-full" />
                        <div className="flex-1 bg-emerald-500 rounded-full" />
                        <div className="flex-1 bg-emerald-500 rounded-full" />
                        <div className="flex-1 bg-slate-200 rounded-full" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Strong</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Confirm Password
                    </label>
                    <div className="relative mb-2">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Both passwords must match exactly.</span>
                  </div>
                </div>

                {/* Info Footer */}
                {/* <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <Info size={16} className="text-blue-500" />
                    <span className="text-xs font-medium">Password was last updated 3 months ago.</span>
                  </div>
                  <div className="text-[10px] font-mono font-medium text-slate-400 bg-white px-2.5 py-1 rounded border border-slate-200">
                    2FA: Active
                  </div>
                </div> */}

                {/* Actions */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setMessage(null);
                    }}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
