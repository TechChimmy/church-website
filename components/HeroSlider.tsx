"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Slide = {
  id: string | number;
  gradient?: string;
  imageUrl?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "default-1",
    gradient: "from-[#3D1126] via-[#6D2C4E] to-[#4A1A35]",
    title: "Welcome Home",
    subtitle: "Sunday Service · 9am & 11am",
    ctaText: "Join Us Live",
    ctaHref: "/join-us-live",
  },
  {
    id: "default-2",
    gradient: "from-[#2A0E1C] via-[#8C3A63] to-[#4D1530]",
    title: "Faith. Hope. Love.",
    subtitle: "Building a community rooted in Christ",
    ctaText: "About Us",
    ctaHref: "/about",
  },
  {
    id: "default-3",
    gradient: "from-[#1F0D16] via-[#5C2440] to-[#3D1126]",
    title: "Come as You Are",
    subtitle: "You are welcome here, always",
    ctaText: "Visit Us",
    ctaHref: "/",
  },
];

export default function HeroSlider({ slides = DEFAULT_SLIDES }: { slides?: Slide[] }) {
  const [current, setCurrent] = useState(0);
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

  return (
    <section className="relative w-full h-[420px] sm:h-[480px] overflow-hidden" style={{ backgroundColor: "#3D1126" }}>
      <AnimatePresence mode="wait">
        {slidesToUse.map((slide, i) =>
          i === current ? (
            <motion.div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient ?? "from-[#3D1126] via-[#6D2C4E] to-[#4A1A35]"}`}
              style={ {
                backgroundImage: `url(${slide.imageUrl || `/images/hero/slide-${(i) + 1}.jpg`})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Overlay */}
              <div className="absolute inset-0" style={{ backgroundColor: "rgba(31,5,20,0.55)" }} />

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

                <h1 className="font-playfair text-[30px] sm:text-[42px] font-bold tracking-wide
                               leading-tight mb-3"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                  {slide.title}
                </h1>
                <p className="font-lato text-[13px] uppercase tracking-[2.5px]
                             mb-7" style={{ color: "rgba(243,233,229,0.85)" }}>
                  {slide.subtitle}
                </p>
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
                  {slide.ctaText}
                </a>
              </motion.div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Arrows */}
      <button onClick={() => go(current - 1)} aria-label="Previous slide"
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
      <button onClick={() => go(current + 1)} aria-label="Next slide"
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
          <button key={i} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "var(--accent-beige)" : "rgba(255,255,255,0.3)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
