"use client";

import { useState } from "react";

type PraySectionProps = {
  heading: string;
  initialPrayers?: Array<{
    id: string;
    name: string | null;
    prayerRequest: string;
    anonymous: boolean;
    createdAt: string;
  }>;
};

export default function PraySection({ heading, initialPrayers = [] }: PraySectionProps) {
  const [form, setForm] = useState({ name: "", email: "", prayerRequest: "", anonymous: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.prayerRequest.trim()) return;
    if (!form.anonymous && (!form.name.trim() || !form.email.trim())) {
      setError("Please fill in your name and email, or submit anonymously.");
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
        setForm({ name: "", email: "", prayerRequest: "", anonymous: false });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10"
      style={{ backgroundColor: "var(--accent-beige)", borderTop: "1px solid rgba(140,58,99,0.1)", borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Form Column */}
        <div className="max-w-[600px] w-full">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
            <h2 className="font-playfair text-[24px] font-bold" style={{ color: "var(--text-dark)" }}>
              {heading}
            </h2>
          </div>

          {submitted ? (
            <p className="font-lato text-[14px] font-medium py-3" style={{ color: "var(--burgundy)" }}>
              ✓ Thank you. Your message has been received.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {!form.anonymous && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex-1 church-input"
                    style={{ backgroundColor: "white" }}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="flex-1 church-input"
                    style={{ backgroundColor: "white" }}
                  />
                </div>
              )}

              <div className="flex">
                <input
                  type="text"
                  value={form.prayerRequest}
                  onChange={(e) => setForm({ ...form, prayerRequest: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Share your prayer request here..."
                  className="flex-1 church-input border-r-0"
                  style={{ backgroundColor: "white" }}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="font-lato text-white text-[11px] font-bold uppercase tracking-[1.2px] px-7 py-3
                             transition-all duration-200 disabled:opacity-60"
                  style={{ backgroundColor: "var(--burgundy)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
                >
                  {loading ? "..." : "Submit"}
                </button>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: "var(--burgundy)" }}
                />
                <span className="font-lato text-[12.5px]" style={{ color: "#8A7078" }}>
                  Submit anonymously
                </span>
              </label>

              {error && <p className="font-lato text-[12.5px] text-red-500">{error}</p>}
            </div>
          )}
        </div>

        {/* Recent Prayers Column */}
        {initialPrayers && initialPrayers.length > 0 && (
          <div className="w-full">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
              <h3 className="font-playfair text-[20px] font-bold" style={{ color: "var(--text-dark)" }}>
                Recent Prayer Requests
              </h3>
            </div>
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {initialPrayers.map((p) => (
                <div key={p.id} className="bg-white border border-stone-200/60 p-4 rounded-sm shadow-sm transition-all duration-200 hover:shadow-md">
                  <p className="font-lato text-[13px] text-stone-700 italic leading-relaxed">
                    &ldquo;{p.prayerRequest}&rdquo;
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-lato text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--burgundy)" }}>
                      — {p.anonymous || !p.name ? "Anonymous" : p.name}
                    </span>
                    <span className="font-lato text-[10px] text-stone-400">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

