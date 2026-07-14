"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function JoinAskCollins({ defaultVideoName = "" }: { defaultVideoName?: string }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    question: "",
    videoName: defaultVideoName,
    timestamp: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync default video name if it loads later
  useEffect(() => {
    if (defaultVideoName) {
      setForm((f) => ({ ...f, videoName: defaultVideoName }));
    }
  }, [defaultVideoName]);

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.question.trim()) {
      setError(t("joinAskCollins.errorFillAll"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t("joinAskCollins.errorEmail"));
      return;
    }
    if (form.timestamp.trim() && !/^\d{1,2}:\d{2}(:\d{2})?$/.test(form.timestamp.trim())) {
      setError(t("joinAskCollins.errorTimestamp"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ask-collins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "join-us-live",
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({
          name: "",
          phone: "",
          email: "",
          question: "",
          videoName: defaultVideoName,
          timestamp: "",
        });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error ?? t("joinAskCollins.errorSomethingWrong"));
      }
    } catch {
      setError(t("joinAskCollins.errorNetworkError"));
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
              {t("joinAskCollins.heading")}
            </h2>
          </div>

          {submitted ? (
            <p className="font-lato text-[13px] font-medium py-2" style={{ color: "var(--burgundy)" }}>
              {t("joinAskCollins.successMessage")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Row 1 — Name + Phone */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t("joinAskCollins.namePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  suppressHydrationWarning={true}
                  className="flex-1 church-input"
                  style={{ backgroundColor: "white" }}
                />
                <input
                  type="tel"
                  placeholder={t("joinAskCollins.phonePlaceholder")}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  suppressHydrationWarning={true}
                  className="flex-1 church-input"
                  style={{ backgroundColor: "white" }}
                />
              </div>

              {/* Row 2 — Email */}
              <input
                type="email"
                placeholder={t("joinAskCollins.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                suppressHydrationWarning={true}
                className="w-full church-input"
                style={{ backgroundColor: "white" }}
              />

              {/* Row 3 — Video Name + Timestamp */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={t("joinAskCollins.videoPlaceholder")}
                  value={form.videoName}
                  onChange={(e) => setForm({ ...form, videoName: e.target.value })}
                  suppressHydrationWarning={true}
                  className="flex-1 church-input"
                  style={{ backgroundColor: "white" }}
                />
                <input
                  type="text"
                  placeholder={t("joinAskCollins.timestampPlaceholder")}
                  value={form.timestamp}
                  onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
                  suppressHydrationWarning={true}
                  className="flex-1 church-input"
                  style={{ backgroundColor: "white" }}
                />
              </div>

              {/* Row 4 — Question & Submit */}
              <div className="flex">
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                  placeholder={t("joinAskCollins.questionPlaceholder")}
                  suppressHydrationWarning={true}
                  className="flex-1 church-input border-r-0"
                  style={{ backgroundColor: "white" }}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  suppressHydrationWarning={true}
                  className="font-lato text-white text-[11px] font-bold uppercase tracking-[1.2px]
                             px-7 py-3 shrink-0 transition-all duration-200 disabled:opacity-60"
                  style={{ backgroundColor: "var(--burgundy)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
                >
                  {loading ? t("joinAskCollins.submitting") : t("joinAskCollins.submit")}
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
