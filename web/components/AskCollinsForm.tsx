"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function AskCollinsForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    question: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) {
      setError(t("askCollins.errorName"));
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 5) {
      setError(t("askCollins.errorPhone"));
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t("askCollins.errorEmail"));
      return;
    }
    if (!form.question.trim() || form.question.trim().length < 5) {
      setError(t("askCollins.errorQuestion"));
      return;
    }
    if (!form.consent) {
      setError(t("askCollins.errorConsent"));
      return;
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
        setForm({ name: "", phone: "", email: "", question: "", consent: false });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        const data = await res.json();
        setError(data.error ?? t("askCollins.errorSomethingWrong"));
      }
    } catch {
      setError(t("askCollins.errorNetworkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="py-16 sm:py-20 px-4 sm:px-10 overflow-hidden"
      style={{ backgroundColor: "var(--accent-beige)", borderTop: "1px solid rgba(140,58,99,0.1)", borderBottom: "1px solid rgba(140,58,99,0.1)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-[760px] mx-auto">
        {/* Heading */}
        <div className="flex flex-col items-center mb-8">
          <span className="font-lato text-[11px] uppercase tracking-[3px] mb-2" style={{ color: "var(--burgundy)" }}>
            {t("askCollins.tagline")}
          </span>
          <h2 className="font-playfair text-[28px] sm:text-[34px] font-bold text-stone-900 leading-tight text-center" style={{ color: "var(--text-dark)" }}>
            {t("askCollins.heading")}
          </h2>
          <div className="w-12 h-[2px] rounded-full mt-4" style={{ backgroundColor: "var(--burgundy)" }} />
        </div>

        {/* Card for the Form */}
        <div className="bg-white p-6 sm:p-10 rounded-sm" style={{ border: "1px solid rgba(140,58,99,0.12)", boxShadow: "0 4px 20px rgba(140,58,99,0.06)" }}>
          <p className="font-lato text-[14px] text-stone-500 leading-relaxed mb-8 text-center">
            {t("askCollins.subheading")}
          </p>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-3xl mb-2 text-[var(--burgundy)]">✓</span>
              <p className="font-lato text-[14px] text-[var(--burgundy)] font-bold">
                {t("askCollins.successMessage")}
              </p>
            </div>
          ) : (
            <div className="w-full">
              {/* Row 1 — Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder={t("askCollins.namePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="church-input bg-white w-full"
                  style={{ backgroundColor: "white" }}
                />
                <input
                  suppressHydrationWarning
                  type="tel"
                  placeholder={t("askCollins.phonePlaceholder")}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="church-input bg-white w-full"
                  style={{ backgroundColor: "white" }}
                />
              </div>

              {/* Row 2 — Email */}
              <div className="mb-4">
                <input
                  suppressHydrationWarning
                  type="email"
                  placeholder={t("askCollins.emailPlaceholder")}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="church-input bg-white w-full"
                  style={{ backgroundColor: "white" }}
                />
              </div>

              {/* Row 3 — Question textarea */}
              <textarea
                suppressHydrationWarning
                placeholder={t("askCollins.questionPlaceholder")}
                rows={5}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="church-input bg-white w-full resize-y mb-4"
                style={{ backgroundColor: "white" }}
              />

              {/* Row 4 — Consent Checkbox */}
              <div className="mb-6 flex flex-col gap-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    suppressHydrationWarning
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                    style={{ accentColor: "var(--burgundy)" }}
                  />
                  <span className="font-lato text-[12.5px] text-stone-600 leading-normal">
                    {t("askCollins.consentText")}
                  </span>
                </label>
              </div>

              {/* Row 5 — Submit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-100">
                <span className="font-lato text-[11px] text-stone-400">{t("askCollins.allFieldsRequired")}</span>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="shrink-0 btn-primary disabled:opacity-60"
                >
                  {loading ? t("askCollins.submitting") : t("askCollins.submit")}
                </button>
              </div>

              {error && (
                <p className="font-lato text-[12.5px] text-red-500 mt-3 text-center">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
