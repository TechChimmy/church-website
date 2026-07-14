"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

type FooterContactProps = {
  address?: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
};

const DEFAULT_ADDRESS = "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.";
const DEFAULT_PHONE = "+91 98876 54321";
const DEFAULT_EMAIL = "info@cftchurch.com";
const DEFAULT_MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000";

export default function FooterContact({
  address = DEFAULT_ADDRESS,
  phone = DEFAULT_PHONE,
  email = DEFAULT_EMAIL,
  mapUrl = DEFAULT_MAP_URL,
}: FooterContactProps) {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError(t("footer.errorFillAll"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSent(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error ?? t("footer.errorSomethingWrong"));
      }
    } catch {
      setError(t("footer.errorNetworkError"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
    color: "white",
  };
  const inputFocusStyle = { borderColor: "var(--burgundy-secondary)" };

  const displayAddress = address === DEFAULT_ADDRESS
    ? (lang === "ta" ? "75, அண்ணா சாலை, சென்னை,\nதமிழ்நாடு 600002, இந்தியா." : DEFAULT_ADDRESS)
    : address;

  return (
    <footer style={{ backgroundColor: "var(--bg-footer)" }} id="footer-visit">
      {/* Top burgundy accent line */}
      <div className="h-[3px]"
        style={{ background: "linear-gradient(90deg, var(--burgundy-dark), var(--burgundy), var(--burgundy-secondary), var(--burgundy))" }} />

      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Column 1: Visit Us */}
        <div className="px-6 sm:px-10 py-10 sm:py-12 border-b md:border-b-0 md:border-r"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="w-6 h-[2px] rounded-full mb-4" style={{ backgroundColor: "var(--burgundy-secondary)" }} />
          <h3 className="font-playfair text-[18px] font-semibold text-white mb-4">{t("footer.visitUs")}</h3>
          <p className="font-lato text-[13px] leading-loose" style={{ color: "rgba(255,255,255,0.45)" }}>
            {displayAddress.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
            <span>{phone}</span><br />
            <span>{email}</span>
          </p>
        </div>

        {/* Column 2: Map */}
        <div className="px-6 sm:px-10 py-10 sm:py-12 border-b md:border-b-0 md:border-r flex items-center"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="w-full h-[180px] overflow-hidden rounded-sm"
            style={{ border: "1px solid rgba(140,58,99,0.3)" }}>
            <iframe
              src={mapUrl}
              className="w-full h-full border-0"
              style={{ filter: "grayscale(20%) saturate(0.9)" }}
              allowFullScreen
            />
          </div>
        </div>

        {/* Column 3: Write To Us */}
        <div className="px-6 sm:px-10 py-10 sm:py-12">
          <div className="mb-4">
            <div className="w-6 h-[2px] rounded-full mb-3" style={{ backgroundColor: "var(--burgundy-secondary)" }} />
            <h3 className="font-playfair text-[18px] font-semibold text-white">{t("footer.writeToUs")}</h3>
          </div>

          {sent ? (
            <p className="font-lato text-[13px] py-2" style={{ color: "rgba(243,233,229,0.85)" }}>
              {t("footer.successMessage")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  suppressHydrationWarning
                  type="text" placeholder={t("footer.namePlaceholder")} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3 py-[10px] font-lato text-[12.5px] border outline-none
                             placeholder:text-white/25 transition-colors duration-200 rounded-sm"
                  style={inputStyle}
                  onFocus={e => Object.assign((e.target as HTMLElement).style, inputFocusStyle)}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <input
                  suppressHydrationWarning
                  type="email" placeholder={t("footer.emailPlaceholder")} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="px-3 py-[10px] font-lato text-[12.5px] border outline-none
                             placeholder:text-white/25 transition-colors duration-200 rounded-sm"
                  style={inputStyle}
                  onFocus={e => Object.assign((e.target as HTMLElement).style, inputFocusStyle)}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              <textarea
                suppressHydrationWarning
                placeholder={t("footer.messagePlaceholder")} rows={3} value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-[10px] font-lato text-[12.5px] border outline-none
                           resize-y placeholder:text-white/25 transition-colors duration-200 rounded-sm mb-2"
                style={inputStyle}
                onFocus={e => Object.assign((e.target as HTMLElement).style, inputFocusStyle)}
                onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              <button
                suppressHydrationWarning
                type="button" onClick={handleSubmit} disabled={loading}
                className="w-full py-3 font-lato text-white text-[11px] font-bold uppercase
                           tracking-[1.2px] transition-all duration-200 rounded-sm disabled:opacity-60"
                style={{ backgroundColor: "var(--burgundy)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-secondary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
              >
                {loading ? t("footer.submitting") : t("footer.submit")}
              </button>
              {error && <p className="font-lato text-[12px] text-red-400 mt-2">{error}</p>}
            </>
          )}
        </div>
      </div>

      {/* Footer bottom copyright is rendered per-page below FooterContact */}

    </footer>
  );
}
