"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ALL_ANSWERS = [
  { id: 1, imageLeft: false, title: "Try Jesus", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 2, imageLeft: true,  title: "The Word of God", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 3, imageLeft: false, title: "Faith Over Fear", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 4, imageLeft: true,  title: "Grace and Truth", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 5, imageLeft: false, title: "Walking in the Spirit", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 6, imageLeft: true,  title: "The Power of Prayer", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 7, imageLeft: false, title: "Renewed Every Morning", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
];

const PAGE_SIZE = 2;
const TOTAL_PAGES = Math.ceil(ALL_ANSWERS.length / PAGE_SIZE);
const PREVIEW_LENGTH = 180;

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > PREVIEW_LENGTH;
  const preview = isLong ? text.slice(0, PREVIEW_LENGTH) + "…" : text;

  return (
    <div className="mb-5">
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={expanded ? "full" : "preview"}
          className="font-lato text-[13px] leading-[1.85] mb-3"
          style={{ color: "#8A7078" }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {expanded ? text : preview}
        </motion.p>
      </AnimatePresence>
      {isLong && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

export default function AnswersFromTheWord() {
  const [page, setPage] = useState(1);

  const pageItems = ALL_ANSWERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goTo(p: number) {
    if (p < 1 || p > TOTAL_PAGES) return;
    setPage(p);
    // Smooth scroll to section top
    document.getElementById("answers-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Build visible page buttons (always show first, last, current ± 1)
  function getPageNums(): (number | "…")[] {
    const pages: (number | "…")[] = [];
    const range = new Set([1, TOTAL_PAGES, page - 1, page, page + 1].filter(n => n >= 1 && n <= TOTAL_PAGES));
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
        <div className="flex items-center gap-4 mb-10">
          <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[26px] font-bold" style={{ color: "var(--text-dark)" }}>
            Answers from the Word
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-12"
          >
            {pageItems.map((item) => (
              <div key={item.id}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-start">
                {/* Text */}
                <div className={item.imageLeft ? "order-2" : "order-1"}>
                  <div className="w-5 h-[2px] rounded-full mb-3" style={{ backgroundColor: "var(--burgundy)" }} />
                  <h3 className="font-playfair text-[19px] font-semibold mb-3" style={{ color: "var(--text-dark)" }}>
                    {item.title}
                  </h3>
                  <ExpandableText text={item.body} />
                </div>

                {/* Image */}
                {/* Image */}
                <div className={item.imageLeft ? "order-1" : "order-2"}>
                  <img
                    src={`/images/answers/answer-${item.id}.jpg`}
                    alt={item.title}
                    className="w-full h-[210px] object-cover rounded-sm"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1 mt-14 flex-wrap">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 font-lato text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all duration-200 disabled:opacity-30"
            style={{ backgroundColor: "transparent", color: "var(--burgundy)", border: "1px solid rgba(140,58,99,0.25)" }}
            onMouseEnter={e => { if (page !== 1) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            ‹ Prev
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
            disabled={page === TOTAL_PAGES}
            className="px-3 py-1.5 font-lato text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all duration-200 disabled:opacity-30"
            style={{ backgroundColor: "transparent", color: "var(--burgundy)", border: "1px solid rgba(140,58,99,0.25)" }}
            onMouseEnter={e => { if (page !== TOTAL_PAGES) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            Next ›
          </button>
        </div>

        <p className="text-center mt-3 font-lato text-[11px]" style={{ color: "rgba(140,58,99,0.4)" }}>
          Page {page} of {TOTAL_PAGES} · {ALL_ANSWERS.length} answers
        </p>
      </div>
    </section>
  );
}
