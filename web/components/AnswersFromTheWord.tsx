"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

type AnswerItem = {
  id: string | number;
  title: string;
  titleTa?: string;
  body: string;
  bodyTa?: string;
  imageUrl?: string | null;
  category?: string;
  publishDate?: string;
  excerpt?: string;
};

const ALL_ANSWERS = [
  { id: 1, title: "Try Jesus", titleTa: "இயேசுவை தேடுங்கள்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: 2, title: "The Word of God", titleTa: "தேவனுடைய வார்த்தை", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: 3, title: "Faith Over Fear", titleTa: "பயத்திற்கு மேல் விசுவாசம்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: 4, title: "Grace and Truth", titleTa: "கிருபையும் சத்தியமும்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: 5, title: "Walking in the Spirit", titleTa: "ஆவியிலே நடத்தல்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: 6, title: "The Power of Prayer", titleTa: "ஜெபத்தின் வல்லமை", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: 7, title: "Renewed Every Morning", titleTa: "காலைதோறும் புதிய கிருபை", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." }
];

const PAGE_SIZE = 4;

export default function AnswersFromTheWord({ initialAnswers = [] }: { initialAnswers?: any[] }) {
  const { lang, t } = useLanguage();
  const answers = (initialAnswers && initialAnswers.length > 0)
    ? initialAnswers.map((item) => {
        const title = lang === "ta" && item.titleTa ? item.titleTa : (item.title || item.question || "");
        const body = lang === "ta" && item.answerTa ? item.answerTa : (item.answer ?? "");
        const excerpt = lang === "ta" && item.excerptTa ? item.excerptTa : (item.excerpt ?? (body ? (body.slice(0, 160) + "...") : ""));
        return {
          id: item._id ?? item.id,
          title,
          body,
          imageUrl: item.imageUrl ?? null,
          category: item.category ?? "Word",
          publishDate: item.publishDate ?? item._createdAt ?? new Date().toISOString(),
          excerpt,
        };
      })
    : ALL_ANSWERS.map((item) => ({
        id: item.id,
        title: lang === "ta" ? item.titleTa : item.title,
        body: item.body,
        imageUrl: `/images/answers/answer-${item.id}.jpg`,
        category: lang === "ta" ? "விசுவாசம்" : "Faith",
        publishDate: new Date().toISOString(),
        excerpt: item.body.slice(0, 160) + "...",
      }));

  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(answers.length / PAGE_SIZE);
  const pageItems = answers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goTo(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    document.getElementById("answers-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getPageNums(): (number | "…")[] {
    const pages: (number | "…")[] = [];
    const range = new Set([1, totalPages, page - 1, page, page + 1].filter(n => n >= 1 && n <= totalPages));
    const sorted = Array.from(range).sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && (sorted[i] as number) - (sorted[i - 1] as number) > 1) pages.push("…");
      pages.push(sorted[i]);
    }
    return pages;
  }

  return (
    <section id="answers-section" className="py-12 sm:py-16 px-4 sm:px-10 bg-white"
      style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center mb-12">
          <span className="font-lato text-[11px] uppercase tracking-[3px] mb-2" style={{ color: "var(--burgundy)" }}>
            {lang === "ta" ? "சத்தியத்தை ஆராயுங்கள்" : "EXPLORE THE TRUTH"}
          </span>
          <h2 className="font-playfair text-[28px] sm:text-[34px] font-bold text-stone-900 leading-tight text-center" style={{ color: "var(--text-dark)" }}>
            {t("answers.heading")}
          </h2>
          <div className="w-12 h-[2px] rounded-full mt-4" style={{ backgroundColor: "var(--burgundy)" }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
          >
            {pageItems.map((item) => {
              const displayDate = item.publishDate 
                ? new Date(item.publishDate).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", { month: "short", day: "numeric", year: "numeric" })
                : "";
              return (
                <div key={item.id}
                  className="group border border-stone-200/60 rounded-sm overflow-hidden flex flex-col bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out h-full justify-between"
                  style={{ border: "1px solid rgba(140,58,99,0.12)", boxShadow: "0 2px 12px rgba(140,58,99,0.04)" }}>
                  
                  <div>
                    {/* Featured Image */}
                    {item.imageUrl && (
                      <div className="relative h-[220px] w-full bg-stone-50 shrink-0 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-2.5 text-[11px] font-lato">
                        {item.category && (
                          <span className="font-bold uppercase tracking-wider text-[var(--burgundy)] bg-[var(--accent-beige)] px-2.5 py-0.5 rounded-sm">
                            {item.category}
                          </span>
                        )}
                        {displayDate && (
                          <span className="text-stone-400 uppercase tracking-wider">
                            {displayDate}
                          </span>
                        )}
                      </div>

                      <h3 className="font-playfair text-[18px] sm:text-[20px] font-bold text-stone-900 mb-3 leading-snug break-words group-hover:text-[var(--burgundy)] transition-colors">
                        {item.title}
                      </h3>

                      <p className="font-lato text-[12.5px] sm:text-[13px] text-stone-500 leading-relaxed break-words line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Read More button wrapper */}
                  <div className="px-6 pb-6 pt-2 shrink-0">
                    <Link
                      href={`/answers/${item.id}`}
                      target="_blank"
                      className="inline-block btn-primary no-underline text-center text-[11px] font-bold uppercase tracking-wider"
                    >
                      {t("events.readMore")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-14 flex-wrap">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 font-lato text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all duration-200 disabled:opacity-30"
              style={{ backgroundColor: "transparent", color: "var(--burgundy)", border: "1px solid rgba(140,58,99,0.25)" }}
              onMouseEnter={e => { if (page !== 1) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {lang === "ta" ? "‹ முந்தைய" : "‹ Prev"}
            </button>

            {getPageNums().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="font-lato text-[12px] px-1" style={{ color: "rgba(140,58,99,0.3)" }}>…</span>
              ) : (
                <button key={p} onClick={() => goTo(p as number)}
                  className="w-8 h-8 font-lato text-[12px] font-bold flex items-center justify-center rounded-sm transition-all duration-200"
                  style={{
                    backgroundColor: page === p ? "var(--burgundy)" : "transparent",
                    color: page === p ? "white" : "#8A7078",
                    border: page === p ? "none" : "1px solid rgba(140,58,99,0.15)",
                  }}
                  onMouseEnter={e => { if (page !== p) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.08)"; }}
                  onMouseLeave={e => { if (page !== p) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 font-lato text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all duration-200 disabled:opacity-30"
              style={{ backgroundColor: "transparent", color: "var(--burgundy)", border: "1px solid rgba(140,58,99,0.25)" }}
              onMouseEnter={e => { if (page !== totalPages) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {lang === "ta" ? "அடுத்த ›" : "Next ›"}
            </button>
          </div>
        )}

        <p className="text-center mt-3 font-lato text-[11px]" style={{ color: "rgba(140,58,99,0.4)" }}>
          {lang === "ta" 
            ? `பக்கம் ${page} / ${totalPages} · ${answers.length} பதில்கள்`
            : `Page ${page} of ${totalPages} · ${answers.length} answers`}
        </p>
      </div>
    </section>
  );
}
