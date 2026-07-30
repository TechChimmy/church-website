"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";

export type Slide = {
  id: string | number;
  gradient?: string;
  imageUrl?: string;
  title: string;
  titleTa?: string;
  subtitle: string;
  subtitleTa?: string;
  ctaText: string;
  ctaHref: string;
};

export default function HeroSlider({ slides = [] }: { slides?: Slide[] }) {
  const { lang, t } = useLanguage();
  const [current, setCurrent] = useState(0);

  const DEFAULT_SLIDES: Slide[] = [
    {
      id: "default-1",
      gradient: "from-[#3D1126] via-[#6D2C4E] to-[#4A1A35]",
      title: t("hero.defaultTitle1"),
      subtitle: t("hero.defaultSubtitle1"),
      ctaText: t("hero.defaultCta1"),
      ctaHref: "/join-us-live",
    },
    {
      id: "default-2",
      gradient: "from-[#2A0E1C] via-[#8C3A63] to-[#4D1530]",
      title: t("hero.defaultTitle2"),
      subtitle: t("hero.defaultSubtitle2"),
      ctaText: t("hero.defaultCta2"),
      ctaHref: "/about",
    },
    {
      id: "default-3",
      gradient: "from-[#1F0D16] via-[#5C2440] to-[#3D1126]",
      title: t("hero.defaultTitle3"),
      subtitle: t("hero.defaultSubtitle3"),
      ctaText: t("hero.defaultCta3"),
      ctaHref: "/",
    },
  ];

  const slidesToUse = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const slideCount = slidesToUse.length;

  const go = useCallback(
    (n: number) => setCurrent((n + slideCount) % slideCount),
    [slideCount]
  );

  useEffect(() => {
    const t = setInterval(() => go(current + 1), 5500);
    return () => clearInterval(t);
  }, [current, go]);

  function getLocalizedCta(ctaText: string) {
    if (ctaText === "About Us") return t("nav.about");
    if (ctaText === "Visit Us") return t("nav.visitUs");
    if (ctaText === "Join Us Live") return t("nav.joinUsLive");
    return ctaText;
  }

  function handleCtaClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href === "#footer-visit") {
      e.preventDefault();
      document.getElementById("footer-visit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section className="relative w-full h-[420px] sm:h-[480px] overflow-hidden" style={{ backgroundColor: "#3D1126" }}>
      <AnimatePresence mode="wait">
        {slidesToUse.map((slide, i) => {
          const title = lang === "ta" && slide.titleTa ? slide.titleTa : slide.title;
          const subtitle = lang === "ta" && slide.subtitleTa ? slide.subtitleTa : slide.subtitle;
          const ctaText = getLocalizedCta(slide.ctaText);

          return i === current ? (
            <motion.div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient ?? "from-[#3D1126] via-[#6D2C4E] to-[#4A1A35]"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={slide.imageUrl || `/images/hero/slide-${(i % 3) + 1}.jpg`}
                alt={title}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(31,5,20,0.55)" }} />

              {/* Warm accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(243,233,229,0.5), transparent)" }} />

              {/* Content */}
              <motion.div
                className="relative z-10 h-full flex flex-col items-center justify-center
                           text-white text-center px-6 sm:px-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Decorative cross mark */}
                <div className="mb-4 opacity-60">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(243,233,229,0.7)" strokeWidth="1.5">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                </div>

                <h1 className="font-playfair text-[24px] sm:text-[34px] md:text-[42px] font-bold tracking-wide
                               leading-tight mb-3"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                  {title}
                </h1>
                <p className="font-lato text-[13px] uppercase tracking-[2.5px]
                             mb-7" style={{ color: "rgba(243,233,229,0.85)" }}>
                  {subtitle}
                </p>
                {slide.ctaHref.startsWith("#") ? (
                  <button
                    type="button"
                    onClick={() => {
                      const id = slide.ctaHref.slice(1);
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="font-lato text-[11px] font-bold uppercase tracking-widest
                               px-7 py-[12px] rounded-sm no-underline
                               transition-all duration-200 will-change-transform"
                    style={{ backgroundColor: "var(--accent-beige)", color: "var(--burgundy-dark)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "white";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-beige)";
                      (e.currentTarget as HTMLElement).style.transform = "";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                  >
                    {ctaText}
                  </button>
                ) : (
                  <a
                     href={slide.ctaHref}
                    className="font-lato text-[11px] font-bold uppercase tracking-widest
                               px-7 py-[12px] rounded-sm no-underline
                               transition-all duration-200 will-change-transform"
                    style={{ backgroundColor: "var(--accent-beige)", color: "var(--burgundy-dark)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "white";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-beige)";
                      (e.currentTarget as HTMLElement).style.transform = "";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                  >
                    {ctaText}
                  </a>
                )}
              </motion.div>
            </motion.div>
          ) : null;
        })}
      </AnimatePresence>

      {/* Arrows */}
      <button suppressHydrationWarning onClick={() => go(current - 1)} aria-label={t("hero.prevSlide")}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10
                   border border-white/25 text-white text-xl
                   flex items-center justify-center
                   transition-all duration-200 rounded-sm leading-none will-change-transform"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.7)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,58,99,0.5)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
        }}
      >‹</button>
      <button suppressHydrationWarning onClick={() => go(current + 1)} aria-label={t("hero.nextSlide")}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10
                   border border-white/25 text-white text-xl
                   flex items-center justify-center
                   transition-all duration-200 rounded-sm leading-none will-change-transform"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.7)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,58,99,0.5)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
        }}
      >›</button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slidesToUse.map((_, i) => (
          <button suppressHydrationWarning key={i} onClick={() => go(i)} aria-label={`${t("hero.goToSlide")} ${i + 1}`}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "var(--accent-beige)" : "rgba(255,255,255,0.3)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Preload subsequent images to prevent transition lag (slide 1 is already priority loaded above) */}
      <div className="hidden" aria-hidden="true">
        {slidesToUse.slice(1).map((slide, idx) => {
          const i = idx + 1;
          return (
            <Image
              key={`preload-${slide.id}`}
              src={slide.imageUrl || `/images/hero/slide-${(i % 3) + 1}.jpg`}
              alt=""
              width={10}
              height={10}
              priority
            />
          );
        })}
      </div>
    </section>
  );
}
