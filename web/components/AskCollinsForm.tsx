"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AskCollinsForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    question: "",
    consent: false,
    anonymous: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.question.trim()) {
      setError("Please enter your question.");
      return;
    }
    if (!form.anonymous) {
      if (!form.name.trim()) {
        setError("Please fill in your name, or submit anonymously.");
        return;
      }
      if (!form.email.trim()) {
        setError("Please fill in your email, or submit anonymously.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ask-collins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: "", email: "", question: "", consent: false, anonymous: false });
        setTimeout(() => setSubmitted(false), 4000);
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
    <motion.section
      className="py-10 sm:py-14 px-4 sm:px-10 bg-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Heading */}
        <h2 className="font-playfair text-[28px] font-bold text-stone-900 mb-3">
          Ask Collins
        </h2>

        {/* Intro paragraph */}
        <p className="font-lato text-[13.5px] text-stone-500 leading-[1.8] mb-8 max-w-[760px]">
          Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a
          quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly
          brewed tea envelope the senses, creating an atmosphere of pure contentment.
        </p>

        {submitted ? (
          <p className="font-lato text-[14px] text-[var(--burgundy)] font-medium py-4">
            ✓ Thank you. Your message has been received.
          </p>
        ) : (
          <div className="max-w-[760px]">
            {/* Anonymous toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none mb-5 w-fit">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: "var(--burgundy)" }}
              />
              <span className="font-lato text-[12.5px]" style={{ color: "#8A7078" }}>
                Submit Anonymously
              </span>
            </label>

            {/* Row 1 — Name + Email (hidden when anonymous) */}
            {!form.anonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Your name please"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-4 py-3 font-lato text-[13px] border border-stone-300
                             outline-none bg-white text-stone-800
                             focus:border-[var(--burgundy)] transition-colors
                             placeholder:text-stone-300"
                />
                <input
                  type="email"
                  placeholder="Your email Id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="px-4 py-3 font-lato text-[13px] border border-stone-300
                             outline-none bg-white text-stone-800
                             focus:border-[var(--burgundy)] transition-colors
                             placeholder:text-stone-300"
                />
              </div>
            )}

            {/* Row 2 — Question textarea */}
            <textarea
              placeholder="Your question goes here..."
              rows={5}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full px-4 py-3 font-lato text-[13px] border border-stone-300
                         outline-none bg-white text-stone-800 resize-y
                         focus:border-[var(--burgundy)] transition-colors
                         placeholder:text-stone-300 mb-4"
            />

            {/* Row 3 — Consent checkbox (only when not anonymous) + Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {!form.anonymous && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="w-4 h-4 accent-[var(--burgundy)] cursor-pointer"
                  />
                  <span className="font-lato text-[12.5px] text-stone-600">
                    I consent to using my name in the video if chosen
                  </span>
                </label>
              )}
              {form.anonymous && <span />}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="shrink-0 btn-primary disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit"}
              </button>
            </div>

            {error && (
              <p className="font-lato text-[12.5px] text-red-500 mt-3">{error}</p>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
