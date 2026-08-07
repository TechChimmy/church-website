"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

type T = { id: string; name: string; nameTa?: string; body: string; bodyTa?: string; imageUrl?: string | null };

type OurCommunityProps = {
  testimonials?: T[] | null;
  heading?: string;
  headingTa?: string;
};

export default function OurCommunity({
  testimonials: initialTestimonials = null,
  heading,
  headingTa,
}: OurCommunityProps) {
  const { lang, t } = useLanguage();
  const displayHeading = lang === "ta" && headingTa ? headingTa : (heading || t("community.heading"));

  const FALLBACK: T[] = [
    { id:"f1", name:"Blake & Kay", body: t("community.fallbackParagraph") },
    { id:"f2", name:"James & Ruth", body: t("community.fallbackParagraph") },
    { id:"f3", name:"Michael & Sarah", body: t("community.fallbackParagraph") },
  ];

  const [testimonials, setTestimonials] = useState<T[]>(initialTestimonials ?? FALLBACK);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      setTestimonials(initialTestimonials);
      return;
    }
    fetch("/api/cms/testimonials")
      .then(r => r.json())
      .then(data => { if (data?.length > 0) setTestimonials(data); })
      .catch(() => {});
  }, [initialTestimonials]);

  const go = (n: number) => setCurrent((n + testimonials.length) % testimonials.length);

  const activeTestimonial = testimonials[current];
  const name = lang === "ta" && activeTestimonial?.nameTa ? activeTestimonial.nameTa : activeTestimonial?.name;
  const body = lang === "ta" && activeTestimonial?.bodyTa ? activeTestimonial.bodyTa : activeTestimonial?.body;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10"
      style={{ backgroundColor: "var(--accent-beige)", borderTop: "1px solid rgba(140,58,99,0.1)", borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
      <div className="max-w-[1280px] mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-8 h-[2px] rounded-full mb-3" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[24px] sm:text-[26px] font-bold text-center"
            style={{ color: "var(--text-dark)" }}>
            {displayHeading}
          </h2>
        </div>

        {/* Quote mark */}
        <div className="text-center text-[48px] leading-none mb-2 font-playfair" style={{ color: "rgba(140,58,99,0.2)" }}>&ldquo;</div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={() => go(current - 1)} aria-label={t("community.prevTestimonial")}
            suppressHydrationWarning={true}
            className="shrink-0 w-9 h-9 border flex items-center justify-center
                       text-xl transition-all duration-200 rounded-sm leading-none will-change-transform"
            style={{ borderColor: "rgba(140,58,99,0.3)", color: "var(--burgundy)" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "var(--burgundy)";
              el.style.color = "white";
              el.style.borderColor = "var(--burgundy)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "";
              el.style.color = "var(--burgundy)";
              el.style.borderColor = "rgba(140,58,99,0.3)";
            }}
          >‹</button>

          <div className="flex-1 min-h-[140px] flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div key={current}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="max-w-[640px] mx-auto flex flex-col items-center"
              >
                {activeTestimonial?.imageUrl && (
                  <img
                    src={activeTestimonial.imageUrl}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover mb-4 border-2 shadow-sm"
                    style={{ borderColor: "rgba(140,58,99,0.3)" }}
                  />
                )}
                <p className="font-playfair text-[16px] font-semibold mb-2"
                  style={{ color: "var(--burgundy)" }}>
                  — {name}
                </p>
                <p className="font-lato text-[13.5px] leading-[1.9]" style={{ color: "#5A4050" }}>
                  {body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={() => go(current + 1)} aria-label={t("community.nextTestimonial")}
            suppressHydrationWarning={true}
            className="shrink-0 w-9 h-9 border flex items-center justify-center
                       text-xl transition-all duration-200 rounded-sm leading-none will-change-transform"
            style={{ borderColor: "rgba(140,58,99,0.3)", color: "var(--burgundy)" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "var(--burgundy)";
              el.style.color = "white";
              el.style.borderColor = "var(--burgundy)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "";
              el.style.color = "var(--burgundy)";
              el.style.borderColor = "rgba(140,58,99,0.3)";
            }}
          >›</button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`${t("community.testimonialN")} ${i + 1}`}
              suppressHydrationWarning={true}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === current ? "var(--burgundy)" : "rgba(140,58,99,0.25)",
                transform: i === current ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
