"use client";

import { useLanguage } from "@/hooks/useLanguage";

type AboutUsSectionProps = {
  heading: string;
  headingTa?: string;
  body: string;
  bodyTa?: string;
};

export default function AboutUsSection({ heading, headingTa, body, bodyTa }: AboutUsSectionProps) {
  const { lang } = useLanguage();
  const displayHeading = lang === "ta" && headingTa ? headingTa : heading;
  const displayBody = lang === "ta" && bodyTa ? bodyTa : body;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 bg-white max-w-[1280px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
        <h2 className="font-playfair text-[28px] font-bold" style={{ color: "var(--text-dark)" }}>
          {displayHeading}
        </h2>
      </div>
      <div className="space-y-4 max-w-[900px] font-lato text-[13.5px] leading-[1.85]"
        style={{ color: "#5A4050" }}>
        {displayBody.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
