"use client";

import { useLanguage } from "@/hooks/useLanguage";

type EventsHeroProps = {
  imageUrl?: string;
  title?: string;
  titleTa?: string;
  subtitle?: string;
  subtitleTa?: string;
};

export default function EventsHero({
  imageUrl,
  title,
  titleTa,
  subtitle,
  subtitleTa,
}: EventsHeroProps) {
  const { lang } = useLanguage();
  const bg = imageUrl || "/images/banners/events.jpg";
  const displayTitle = lang === "ta" && titleTa ? titleTa : (title || (lang === "ta" ? "நிகழ்ச்சிகள்" : "Upcoming Events"));
  const displaySub = lang === "ta" && subtitleTa ? subtitleTa : (subtitle || (lang === "ta" ? "எங்கள் சபை நிகழ்வுகள்" : "Join Us in Fellowship & Worship"));

  return (
    <section
      className="relative w-full h-[240px] sm:h-[280px] overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url('${bg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(31,5,20,0.55)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(243,233,229,0.4), transparent)" }} />
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <p className="font-lato text-[12px] uppercase tracking-[3px] mb-2"
          style={{ color: "rgba(243,233,229,0.7)" }}>
          {displaySub}
        </p>
        <h1 className="font-playfair text-[32px] sm:text-[42px] font-bold text-white leading-tight">
          {displayTitle}
        </h1>
      </div>
    </section>
  );
}
