"use client";

import { useLanguage } from "@/hooks/useLanguage";

export type ServiceItem = {
  id: string;
  title: string;
  titleTa?: string;
  day: string;
  dayTa?: string;
  time: string;
  timeTa?: string;
};

export default function ServiceTimes({ services = [] }: { services?: ServiceItem[] }) {
  const { lang, t } = useLanguage();

  const FALLBACK: ServiceItem[] = [
    { id: "f1", title: t("serviceTimes.fallbackTitle"), day: lang === "ta" ? "ஞாயிறு" : "Sunday", time: "12:00 AM to 03:00 AM" },
    { id: "f2", title: t("serviceTimes.fallbackTitle"), day: lang === "ta" ? "ஞாயிறு" : "Sunday", time: "12:00 to 03:05 AM" },
    { id: "f3", title: t("serviceTimes.fallbackTitle"), day: lang === "ta" ? "ஞாயிறு" : "Sunday", time: "12:00 AM to 03:00 AM" },
    { id: "f4", title: t("serviceTimes.fallbackTitle"), day: lang === "ta" ? "ஞாயிறு" : "Sunday", time: "12:05 AM to 03:00 AM" },
  ];

  const itemsToUse = services.length > 0 ? services : FALLBACK;

  return (
    <section className="bg-white" style={{ borderTop: "1px solid rgba(140,58,99,0.1)" }}>
      <div
        className="grid grid-cols-2 max-w-[1280px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${Math.min(itemsToUse.length, 4)}, minmax(0, 1fr))`,
          borderBottom: "1px solid rgba(140,58,99,0.1)",
        }}
      >
        {itemsToUse.map((svc, i) => {
          const title = lang === "ta" && svc.titleTa ? svc.titleTa : svc.title;
          const day = lang === "ta" && svc.dayTa ? svc.dayTa : svc.day;
          const time = lang === "ta" && svc.timeTa ? svc.timeTa : svc.time;

          return (
            <div
              key={svc.id ?? i}
              className="py-8 sm:py-10 px-5 sm:px-8 flex flex-col gap-1
                         transition-colors duration-200 group cursor-default"
              style={{
                borderRight: (i + 1) % Math.min(itemsToUse.length, 4) !== 0 ? "1px solid rgba(140,58,99,0.1)" : "none",
                borderBottom: itemsToUse.length > 4 && i < itemsToUse.length - (itemsToUse.length % 4 || 4) ? "1px solid rgba(140,58,99,0.1)" : "none",
              }}
            >
              {/* Accent dot */}
              <div className="w-1.5 h-1.5 rounded-full mb-2 transition-transform duration-200 group-hover:scale-125"
                style={{ backgroundColor: "var(--burgundy)" }} />
              <h4 className="font-playfair text-[14px] sm:text-[15px] font-semibold mb-1 transition-colors duration-200 group-hover:text-[var(--burgundy)]"
                style={{ color: "var(--text-dark)" }}>
                {title}
              </h4>
              <p className="font-lato text-[12px] sm:text-[12.5px]" style={{ color: "#8A7078" }}>{day}</p>
              <p className="font-lato text-[12px] sm:text-[12.5px]" style={{ color: "#8A7078" }}>{time}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

