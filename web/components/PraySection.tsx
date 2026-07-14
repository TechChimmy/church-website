"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

type PraySectionProps = {
  heading: string;
  headingTa?: string;
  initialPrayers?: Array<{
    id: string;
    name: string | null;
    prayerRequest: string;
    anonymous: boolean;
    createdAt: string;
  }>;
};

export default function PraySection({ heading, headingTa, initialPrayers = [] }: PraySectionProps) {
  const { lang, t } = useLanguage();
  const activeHeading = lang === "ta" && headingTa ? headingTa : heading;
  const [form, setForm] = useState({ name: "", phone: "", email: "", prayerRequest: "", anonymous: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.prayerRequest.trim()) return;
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError(t("pray.errorFillAll"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/prayer-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: "", phone: "", email: "", prayerRequest: "", anonymous: false });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const data = await res.json();
        setError(data.error ?? t("pray.errorSomethingWrong"));
      }
    } catch {
      setError(t("pray.errorNetworkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 overflow-hidden"
      style={{ backgroundColor: "var(--accent-beige)", borderTop: "1px solid rgba(140,58,99,0.1)", borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
        
        {/* Form Column (Centered) */}
        <div className="max-w-[600px] w-full mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
            <h2 className="font-playfair text-[24px] font-bold text-center" style={{ color: "var(--text-dark)" }}>
              {activeHeading}
            </h2>
            <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
          </div>

          {submitted ? (
            <p className="font-lato text-[14px] font-medium py-3 text-center" style={{ color: "var(--burgundy)" }}>
              {t("pray.successMessage")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Row 1 — Name + Phone */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder={t("pray.namePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 church-input"
                  style={{ backgroundColor: "white" }}
                />
                <input
                  suppressHydrationWarning
                  type="tel"
                  placeholder={t("pray.phonePlaceholder")}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 church-input"
                  style={{ backgroundColor: "white" }}
                />
              </div>

              {/* Row 2 — Email */}
              <input
                suppressHydrationWarning
                type="email"
                placeholder={t("pray.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full church-input"
                style={{ backgroundColor: "white" }}
              />

              {/* Row 3 — Prayer Request & Submit */}
              <div className="flex">
                <input
                  suppressHydrationWarning
                  type="text"
                  value={form.prayerRequest}
                  onChange={(e) => setForm({ ...form, prayerRequest: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={t("pray.prayerPlaceholder")}
                  className="flex-1 church-input border-r-0"
                  style={{ backgroundColor: "white" }}
                />
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="font-lato text-white text-[11px] font-bold uppercase tracking-[1.2px] px-7 py-3
                             transition-all duration-200 disabled:opacity-60"
                  style={{ backgroundColor: "var(--burgundy)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
                >
                  {loading ? t("pray.submitting") : t("pray.submit")}
                </button>
              </div>

              {/* Row 4 — Anonymous toggle */}
              <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                  <input
                    suppressHydrationWarning
                    type="checkbox"
                    checked={form.anonymous}
                    onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: "var(--burgundy)" }}
                  />
                  <span className="font-lato text-[12.5px]" style={{ color: "#8A7078" }}>
                    {t("pray.submitAnonymously")}
                  </span>
                </label>
                {form.anonymous && (
                  <span className="font-lato text-[11.5px] italic" style={{ color: "#8A7078" }}>
                    {t("pray.anonymousNote")}
                  </span>
                )}
              </div>

              {error && <p className="font-lato text-[12.5px] text-red-500 mt-1">{error}</p>}
            </div>
          )}
        </div>

        {/* Recent Prayers Horizontal Marquee */}
        {initialPrayers && initialPrayers.length > 0 && (
          <div className="w-full mt-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
              <h3 className="font-playfair text-[20px] font-bold" style={{ color: "var(--text-dark)" }}>
                {t("pray.recentPrayers")}
              </h3>
              <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
            </div>

            {/* Marquee Outer Container */}
            <div className="w-full overflow-hidden relative py-4">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--accent-beige)] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--accent-beige)] to-transparent z-10 pointer-events-none" />

              <div className="marquee-container flex gap-6">
                <div className="marquee-content flex gap-6">
                  {/* Repeat elements dynamically to guarantee infinite loop coverage */}
                  {Array(Math.max(2, Math.ceil(8 / initialPrayers.length))).fill(initialPrayers).flat().map((p, idx) => (
                    <div key={`${p.id}-${idx}`} className="w-[280px] sm:w-[320px] shrink-0 bg-white border border-stone-200/60 p-4 rounded-sm shadow-sm transition-all duration-200 hover:shadow-md">
                      <p className="font-lato text-[13px] text-stone-700 italic leading-relaxed line-clamp-3">
                        &ldquo;{p.prayerRequest}&rdquo;
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-lato text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--burgundy)" }}>
                          — {p.anonymous || !p.name ? t("pray.anonymous") : p.name}
                        </span>
                        <span className="font-lato text-[10px] text-stone-400">
                          {new Date(p.createdAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-content {
                  display: flex;
                  width: max-content;
                  animation: marquee 35s linear infinite;
                }
                .marquee-container:hover .marquee-content {
                  animation-play-state: paused;
                }
              ` }} />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

