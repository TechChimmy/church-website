"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email, password, redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      if (res.error.includes("too_many_attempts")) {
        setError("Too many failed login attempts. Please try again in 15 minutes.");
      } else {
        setError("Invalid email or password.");
      }
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-lato"
      style={{ backgroundColor: "var(--bg-light)" }}>
      <div className="w-full max-w-[400px]">

        {/* Brand */}
        <div className="text-center mb-10">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--burgundy)" }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"
              stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <h1 className="font-playfair text-[22px] font-bold" style={{ color: "var(--text-dark)" }}>
            Christian Fellowship Church
          </h1>
          <p className="font-lato text-[11px] uppercase tracking-widest mt-1"
            style={{ color: "var(--burgundy)" }}>
            Admin Portal
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-sm p-8"
          style={{ border: "1px solid rgba(140,58,99,0.12)", boxShadow: "0 4px 24px rgba(140,58,99,0.08)" }}>
          <h2 className="font-playfair text-[18px] font-semibold mb-6" style={{ color: "var(--text-dark)" }}>
            Sign In
          </h2>

          {error && (
            <div className="font-lato text-[12px] px-4 py-3 rounded-sm mb-5"
              style={{
                backgroundColor: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#b91c1c",
              }}>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block font-lato text-[11px] uppercase tracking-widest mb-2"
              style={{ color: "#8A7078" }}>
              Email
            </label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              suppressHydrationWarning={true}
              className="w-full px-4 py-3 font-lato text-[13px] border outline-none
                         bg-white transition-colors duration-200 rounded-sm
                         placeholder:text-stone-300"
              style={{ borderColor: "rgba(140,58,99,0.2)", color: "var(--text-dark)" }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--burgundy)"; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)"; }}
            />
          </div>

          <div className="mb-6">
            <label className="block font-lato text-[11px] uppercase tracking-widest mb-2"
              style={{ color: "#8A7078" }}>
              Password
            </label>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              suppressHydrationWarning={true}
              className="w-full px-4 py-3 font-lato text-[13px] border outline-none
                         bg-white transition-colors duration-200 rounded-sm
                         placeholder:text-stone-300"
              style={{ borderColor: "rgba(140,58,99,0.2)", color: "var(--text-dark)" }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--burgundy)"; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)"; }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            suppressHydrationWarning={true}
            className="btn-primary w-full text-center disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center font-lato text-[11px] mt-6" style={{ color: "rgba(140,58,99,0.4)" }}>
          &copy; {new Date().getFullYear()} Christian Fellowship Church
        </p>
      </div>
    </div>
  );
}
