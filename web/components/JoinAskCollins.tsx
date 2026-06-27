"use client";

import { useState } from "react";

export default function JoinAskCollins() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask-collins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value.trim(), anonymous: true }),
      });
      if (res.ok) {
        setSubmitted(true);
        setValue("");
        setTimeout(() => setSubmitted(false), 3000);
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
    <section className="py-10 px-4 sm:px-10 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="rounded-sm px-8 py-8"
          style={{ backgroundColor: "var(--accent-beige)", border: "1px solid rgba(140,58,99,0.12)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
            <h2 className="font-playfair text-[22px] font-bold" style={{ color: "var(--text-dark)" }}>
              Ask Collins
            </h2>
          </div>

          {submitted ? (
            <p className="font-lato text-[13px] font-medium py-2" style={{ color: "var(--burgundy)" }}>
              ✓ Your question has been submitted.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-stretch">
                <input
                  suppressHydrationWarning
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                  placeholder="Your prayer request goes here"
                  className="flex-1 px-4 py-3 font-lato text-[13px] border border-r-0 outline-none
                             transition-colors duration-200 bg-white"
                  style={{ borderColor: "rgba(140,58,99,0.2)", color: "var(--text-dark)" }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--burgundy)"; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(140,58,99,0.2)"; }}
                />
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="font-lato text-white text-[11px] font-bold uppercase tracking-[1.2px]
                             px-7 py-3 shrink-0 transition-all duration-200 disabled:opacity-60"
                  style={{ backgroundColor: "var(--burgundy)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
                >
                  {loading ? "..." : "Submit"}
                </button>
              </div>
              {error && <p className="font-lato text-[12px] text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
