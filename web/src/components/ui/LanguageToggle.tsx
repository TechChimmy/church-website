"use client";

import { useLanguage } from "@/hooks/useLanguage";

interface LanguageToggleProps {
  /** If true, renders a compact version for mobile/collapsed nav states */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

export default function LanguageToggle({ compact = false, className = "" }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`flex items-center rounded-full overflow-hidden ${className}`}
      style={{
        border: "1px solid rgba(140,58,99,0.25)",
        backgroundColor: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(8px)",
      }}
    >
      <button
        type="button"
        aria-pressed={lang === "en"}
        aria-label="Switch to English"
        onClick={() => setLang("en")}
        className="font-lato font-bold transition-all duration-200 focus-visible:outline-none"
        suppressHydrationWarning={true}
        style={{
          fontSize: compact ? 9 : 10,
          letterSpacing: "0.06em",
          padding: compact ? "3px 8px" : "4px 10px",
          backgroundColor: lang === "en" ? "var(--burgundy)" : "transparent",
          color: lang === "en" ? "white" : "var(--burgundy)",
          borderRadius: "9999px 0 0 9999px",
          lineHeight: 1.4,
          cursor: "pointer",
          border: "none",
        }}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={lang === "ta"}
        aria-label="தமிழுக்கு மாறவும் (Switch to Tamil)"
        onClick={() => setLang("ta")}
        className="font-lato font-bold transition-all duration-200 focus-visible:outline-none"
        suppressHydrationWarning={true}
        style={{
          fontSize: compact ? 9 : 10,
          letterSpacing: "0.02em",
          padding: compact ? "3px 8px" : "4px 10px",
          backgroundColor: lang === "ta" ? "var(--burgundy)" : "transparent",
          color: lang === "ta" ? "white" : "var(--burgundy)",
          borderRadius: "0 9999px 9999px 0",
          lineHeight: 1.4,
          cursor: "pointer",
          border: "none",
        }}
      >
        தமிழ்
      </button>
    </div>
  );
}
