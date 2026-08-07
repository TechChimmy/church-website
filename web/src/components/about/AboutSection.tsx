"use client";

import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";

type AboutSectionProps = {
  heading: string;
  headingTa?: string;
  body: string;
  bodyTa?: string;
  imageUrl?: string;
};

export default function AboutSection({ heading, headingTa, body, bodyTa, imageUrl }: AboutSectionProps) {
  const { lang, t } = useLanguage();
  const activeHeading = lang === "ta" && headingTa ? headingTa : heading;
  const activeBody = lang === "ta" && bodyTa ? bodyTa : body;
  const imageSrc = imageUrl || "/images/about/section.jpg";

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2" style={{ minHeight: "380px" }}>
      {/* Left — dark card */}
      <div className="px-6 sm:px-12 py-10 sm:py-14 flex flex-col justify-center"
        style={{ background: "linear-gradient(135deg, #2A0E1C 0%, #3D1126 60%, #1F0D16 100%)" }}>
        {/* Accent line */}
        <div className="w-8 h-[2px] rounded-full mb-5" style={{ backgroundColor: "var(--accent-beige)" }} />
        <h2 className="font-playfair text-[24px] sm:text-[28px] font-bold text-white mb-5 leading-tight">
          {activeHeading.split(" ")[0]}{" "}
          <span style={{ color: "var(--accent-beige)" }}>{activeHeading.split(" ").slice(1).join(" ")}</span>
        </h2>
        <p className="font-lato text-[13px] sm:text-[13.5px] leading-[1.85] mb-3"
          style={{ color: "rgba(243,233,229,0.75)" }}>
          {activeBody}
        </p>
        <p className="font-lato text-[13px] sm:text-[13.5px] leading-[1.85] mb-3"
          style={{ color: "rgba(243,233,229,0.75)" }}>
          {t("about.fallbackParagraph")}
        </p>
        <a href="/about" className="btn-outline self-start mt-4"
          style={{ color: "var(--accent-beige)", borderColor: "rgba(243,233,229,0.4)" }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "rgba(243,233,229,0.15)";
            el.style.borderColor = "rgba(243,233,229,0.7)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "";
            el.style.borderColor = "rgba(243,233,229,0.4)";
          }}
        >
          {t("about.learnMore")}
        </a>
      </div>

      {/* Right — image */}
      <div className="relative overflow-hidden order-first sm:order-last min-h-[380px]">
        <Image
          src={imageSrc}
          alt="About Us"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
