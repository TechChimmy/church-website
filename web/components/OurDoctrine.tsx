"use client";

import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";

export type DoctrineImages = Partial<{
  word: string;
  faith: string;
  spirit: string;
  church: string;
}>;

export default function OurDoctrine({ images }: { images?: DoctrineImages }) {
  const { t } = useLanguage();

  const DOCTRINE_ITEMS = [
    { id: 1, image: images?.word   || "/images/doctrine/word.jpg",   title: t("doctrine.word"),   desc: t("doctrine.fallbackItemDesc") },
    { id: 2, image: images?.faith  || "/images/doctrine/faith.jpg",  title: t("doctrine.faith"),  desc: t("doctrine.fallbackItemDesc") },
    { id: 3, image: images?.spirit || "/images/doctrine/spirit.jpg", title: t("doctrine.spirit"), desc: t("doctrine.fallbackItemDesc") },
    { id: 4, image: images?.church || "/images/doctrine/church.jpg", title: t("doctrine.church"), desc: t("doctrine.fallbackItemDesc") },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 bg-white"
      style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[22px] sm:text-[24px] font-bold" style={{ color: "var(--text-dark)" }}>
            {t("doctrine.heading")}
          </h2>
        </div>
        <p className="font-lato text-[13px] sm:text-[13.5px] leading-[1.85] mb-10 max-w-[800px]"
          style={{ color: "#8A7078" }}>
          {t("doctrine.fallbackParagraph")}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-10">
          {DOCTRINE_ITEMS.map((item) => (
            <div key={item.id}
              className="flex flex-col items-center text-center group cursor-default"
            >
              <div
                className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full mb-4
                            flex items-center justify-center overflow-hidden shrink-0
                            transition-all duration-200"
                style={{
                  backgroundColor: "rgba(140,58,99,0.1)",
                  border: "2px solid rgba(140,58,99,0.15)",
                }}
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
                <Image
                  src={item.image}
                  alt={item.title}
                  width={110}
                  height={110}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-playfair text-[14px] sm:text-[15px] font-semibold mb-2
                             transition-colors duration-200 group-hover:text-[var(--burgundy)]"
                style={{ color: "var(--text-dark)" }}>
                {item.title}
              </h4>
              <p className="font-lato text-[12px] sm:text-[12.5px] leading-relaxed"
                style={{ color: "#8A7078" }}>
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
