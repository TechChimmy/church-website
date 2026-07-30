"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import VideoModal from "@/components/ui/video-modal";
import type { YouTubeVideo } from "@/types/youtube";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  sermons: YouTubeVideo[];
  title?: string;
}

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return "";
  }
}

/* Fallback card when no real data */
function PlaceholderCard({ index }: { index: number }) {
  const { t } = useLanguage();
  return (
    <div
      className="relative rounded-lg overflow-hidden bg-stone-300 cursor-default"
      style={{ aspectRatio: "16/9" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {/* Play circle */}
        <div className="w-10 h-10 rounded-full border-2 border-stone-500/60
                        flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-stone-500/70">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <span className="font-lato text-[10px] text-stone-500 uppercase tracking-wider">
          {t("sermons.sermon")} {index + 1}
        </span>
      </div>
    </div>
  );
}

export default function PreviousSermons({ sermons, title }: Props) {
  const { lang, t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [sermons]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      // Scroll by approximately two cards
      const cardWidth = 320;
      const scrollTo = direction === "left" 
        ? scrollLeft - cardWidth * 2 
        : scrollLeft + cardWidth * 2;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const displayTitle = title ?? t("sermons.previousSermons");

  return (
    <section className="py-8 sm:py-10 px-4 sm:px-10 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-playfair text-[20px] font-semibold text-stone-900">
            {displayTitle}
          </h3>
          {sermons.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-9 h-9 rounded-full border border-stone-300 bg-white
                           flex items-center justify-center text-stone-600 hover:text-stone-900
                           hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none
                           transition-all duration-200"
                aria-label="Scroll left"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-9 h-9 rounded-full border border-stone-300 bg-white
                           flex items-center justify-center text-stone-600 hover:text-stone-900
                           hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none
                           transition-all duration-200"
                aria-label="Scroll right"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Slider */}
        <div
          ref={sliderRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
        >
          {sermons.length > 0
            ? sermons.map((vid, i) => (
                <motion.div
                  key={vid.videoId}
                  className="relative rounded-lg overflow-hidden cursor-pointer group bg-stone-200 shrink-0 w-[270px] sm:w-[320px]"
                  style={{ aspectRatio: "16/9" }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => setActiveVideo(vid)}
                  role="button"
                  aria-label={`Play: ${vid.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActiveVideo(vid)}
                >
                  {/* Thumbnail */}
                  <Image
                    src={vid.thumbnail}
                    alt={vid.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width:768px) 270px, 320px"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                  transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/60
                                    flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Default play circle (always visible) */}
                  <div className="absolute inset-0 flex flex-col items-end justify-end p-2">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 w-10 h-10 rounded-full border-2 border-white/70
                                    bg-black/30 flex items-center justify-center mx-auto
                                    top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Title + date strip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90
                                  via-black/70 to-transparent px-3 py-2.5 z-10">
                    <p className="font-lato text-[11px] text-white font-bold truncate leading-tight mb-1">
                      {vid.title}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-lato text-[9px] text-white/60 shrink-0">
                        {formatDate(vid.publishedAt ?? "", lang)}
                      </p>
                      <a
                        href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-lato text-[8px] font-bold uppercase tracking-wider
                                   bg-white/15 hover:bg-red-600 hover:text-white text-white/80 px-2 py-0.5 rounded-sm
                                   transition-colors duration-150 no-underline whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lang === "ta" ? "யூடியூபில் காண்க" : "Watch on YouTube"}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[270px] sm:w-[320px]">
                  <PlaceholderCard index={i} />
                </div>
              ))
          }
        </div>
      </div>

      {/* Video modal */}
      {activeVideo && (
        <VideoModal
          videoId={activeVideo.videoId}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </section>
  );
}
