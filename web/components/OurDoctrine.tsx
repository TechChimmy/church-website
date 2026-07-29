"use client";

import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useState } from "react";

export type DoctrineImages = Partial<{
  word: string; faith: string; spirit: string; church: string;
}>;

type DoctrineItemText = {
  title?: string; titleTa?: string; desc?: string; descTa?: string;
};

type DoctrineItemsMap = Partial<{
  word: DoctrineItemText; faith: DoctrineItemText;
  spirit: DoctrineItemText; church: DoctrineItemText;
}>;

interface OurDoctrineProps {
  images?:      DoctrineImages;
  heading?:     string;
  headingTa?:   string;
  paragraph?:   string;
  paragraphTa?: string;
  items?:       DoctrineItemsMap;
}

interface SanityDoctrineItem {
  _id: string;
  title: string;
  titleTa?: string;
  description?: string;
  descriptionTa?: string;
  imageUrl?: string;
  order: number;
  active: boolean;
}

export default function OurDoctrine({
  images, heading, headingTa, paragraph, paragraphTa, items,
}: OurDoctrineProps) {
  const { lang, t } = useLanguage();
  const [dynamicItems, setDynamicItems] = useState<SanityDoctrineItem[]>([]);

  useEffect(() => {
    fetch("/api/cms/doctrine")
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setDynamicItems(data); })
      .catch(() => {});
  }, []);

  const resolvedHeading   = (lang === "ta" && headingTa)   ? headingTa   : (heading   || t("doctrine.heading"));
  const resolvedParagraph = (lang === "ta" && paragraphTa) ? paragraphTa : (paragraph || t("doctrine.fallbackParagraph"));

  function resolveItem(key: keyof DoctrineItemsMap, fallbackTitle: string, fallbackDesc: string, fallbackImage: string) {
    const item = items?.[key];
    const title = (lang === "ta" && item?.titleTa) ? item.titleTa : (item?.title || fallbackTitle);
    const desc  = (lang === "ta" && item?.descTa)  ? item.descTa  : (item?.desc  || fallbackDesc);
    return { title, desc, image: (images as any)?.[key] || fallbackImage };
  }

  // Static fallback items (The Word, The Faith, The Spirit, The Church)
  const staticItems = [
    { id: "static-1", ...resolveItem("word",   t("doctrine.word"),   t("doctrine.fallbackItemDesc"), "/images/doctrine/word.jpg") },
    { id: "static-2", ...resolveItem("faith",  t("doctrine.faith"),  t("doctrine.fallbackItemDesc"), "/images/doctrine/faith.jpg") },
    { id: "static-3", ...resolveItem("spirit", t("doctrine.spirit"), t("doctrine.fallbackItemDesc"), "/images/doctrine/spirit.jpg") },
    { id: "static-4", ...resolveItem("church", t("doctrine.church"), t("doctrine.fallbackItemDesc"), "/images/doctrine/church.jpg") },
  ];

  // Dynamic items from Sanity (active only), sorted by order
  const sanityItems = dynamicItems
    .filter(i => i.active)
    .map(i => ({
      id: i._id,
      title: (lang === "ta" && i.titleTa) ? i.titleTa : i.title,
      desc:  (lang === "ta" && i.descriptionTa) ? i.descriptionTa : (i.description ?? ""),
      image: i.imageUrl || "/images/doctrine/word.jpg",
    }));

  // Show dynamic items if any exist, otherwise fall back to static 4
  const displayItems = sanityItems.length > 0 ? sanityItems : staticItems;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 bg-white"
      style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[22px] sm:text-[24px] font-bold" style={{ color: "var(--text-dark)" }}>
            {resolvedHeading}
          </h2>
        </div>
        <p className="font-lato text-[13px] sm:text-[13.5px] leading-[1.85] mb-10 max-w-[800px]"
          style={{ color: "#8A7078" }}>
          {resolvedParagraph}
        </p>

        <div className={`grid gap-6 sm:gap-8 mb-10 ${displayItems.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
          {displayItems.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center group cursor-default">
              <div
                className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full mb-4
                            flex items-center justify-center overflow-hidden shrink-0 transition-all duration-200"
                style={{ backgroundColor: "rgba(140,58,99,0.1)", border: "2px solid rgba(140,58,99,0.15)" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "rgba(140,58,99,0.18)";
                  el.style.borderColor = "rgba(140,58,99,0.4)";
                  el.style.transform = "scale(1.05)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "rgba(140,58,99,0.1)";
                  el.style.borderColor = "rgba(140,58,99,0.15)";
                  el.style.transform = "";
                }}
              >
                <Image src={item.image} alt={item.title} width={110} height={110} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-playfair text-[14px] sm:text-[15px] font-semibold mb-2 transition-colors duration-200 group-hover:text-[var(--burgundy)]"
                style={{ color: "var(--text-dark)" }}>
                {item.title}
              </h4>
              <p className="font-lato text-[12px] sm:text-[12.5px] leading-relaxed" style={{ color: "#8A7078" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a href="#" className="btn-primary">{t("doctrine.learnMore")}</a>
        </div>
      </div>
    </section>
  );
}
