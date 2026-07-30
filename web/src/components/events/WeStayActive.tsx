"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export type ActivityItem = {
  id?: string;
  _id?: string;
  title: string;
  titleTa?: string;
  description: string;
  descriptionTa?: string;
  imageUrl?: string | null;
  order: number;
  active: boolean;
};

function ExpandableText({ text }: { text: string }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const maxLength = 240;
  const isLong = text.length > maxLength;
  const previewText = isLong ? text.slice(0, maxLength) + "..." : text;

  return (
    <div>
      <div className="overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={expanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="font-lato text-[13px] leading-[1.85] mb-2 break-words"
            style={{ color: "#8A7078" }}
          >
            {expanded ? text : previewText}
          </motion.p>
        </AnimatePresence>
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          suppressHydrationWarning={true}
          className="font-lato text-[11.5px] font-bold text-[var(--burgundy)] hover:underline uppercase tracking-wider mb-4 transition-all duration-200"
        >
          {expanded ? t("weStayActive.showLess") : t("weStayActive.readMore")}
        </button>
      )}
    </div>
  );
}

function getFallbackImage(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("fellowship") || t.includes("ஐக்கிய")) {
    return "/images/activity/fellowship.jpg";
  }
  if (t.includes("retreat") || t.includes("முகாம்")) {
    return "/images/activity/retreat.jpg";
  }
  if (t.includes("evangelical") || t.includes("சுவிசேஷ") || t.includes("sunday")) {
    return "/images/activity/evangelical.jpg";
  }
  return "/images/activity/fellowship.jpg";
}

export default function WeStayActive({ items = [] }: { items?: ActivityItem[] }) {
  const { lang, t } = useLanguage();

  const FALLBACK_ITEMS: ActivityItem[] = [
    {
      id: "fallback-1",
      title: t("weStayActive.fallback1Title"),
      description: t("doctrine.fallbackParagraph"),
      imageUrl: "/images/activity/fellowship.jpg",
      order: 0,
      active: true,
    },
    {
      id: "fallback-2",
      title: t("weStayActive.fallback2Title"),
      description: t("doctrine.fallbackParagraph"),
      imageUrl: "/images/activity/retreat.jpg",
      order: 1,
      active: true,
    },
    {
      id: "fallback-3",
      title: t("weStayActive.fallback3Title"),
      description: t("doctrine.fallbackParagraph"),
      imageUrl: "/images/activity/evangelical.jpg",
      order: 2,
      active: true,
    },
  ];

  const activeItems = items.length > 0 ? items : FALLBACK_ITEMS;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 bg-white"
      style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[22px] sm:text-[26px] font-bold" style={{ color: "var(--text-dark)" }}>
            {t("weStayActive.heading")}
          </h2>
        </div>

        <div className="flex flex-col gap-12 sm:gap-14">
          {activeItems.map((item, idx) => {
            const imageLeft = idx % 2 === 0;
            const title = lang === "ta" && item.titleTa ? item.titleTa : item.title;
            const description = lang === "ta" && item.descriptionTa ? item.descriptionTa : item.description;

            return (
              <div key={item._id ?? item.id ?? `active-${idx}`}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-start">
                {/* Image */}
                <div className={`${imageLeft ? "sm:order-1" : "sm:order-2"} order-1`}>
                  <Image
                    src={item.imageUrl || getFallbackImage(title)}
                    alt={title}
                    width={800}
                    height={500}
                    className="w-full h-[320px] object-cover rounded-sm"
                  />
                </div>

                {/* Text */}
                <div className={`${imageLeft ? "sm:order-2" : "sm:order-1"} order-2`}>
                  <div className="w-6 h-[2px] rounded-full mb-4" style={{ backgroundColor: "var(--burgundy)" }} />
                  <h3 className="font-playfair text-[18px] sm:text-[20px] font-semibold mb-3 sm:mb-4"
                    style={{ color: "var(--text-dark)" }}>
                    {title}
                  </h3>
                  <ExpandableText text={description} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
