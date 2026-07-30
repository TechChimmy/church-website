"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface Question {
  _id: string;
  name: string;
  question: string;
  questionTa?: string | null;
  answer: string;
  answerTa?: string | null;
  answerTitle?: string | null;
  answerTitleTa?: string | null;
  consent?: boolean;
  createdAt: string;
}

export default function AnsweredQuestions({ questions }: { questions: Question[] }) {
  const { lang } = useLanguage();
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
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
  }, [questions]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft } = sliderRef.current;
      // Scroll by approximately one card width
      const cardWidth = 380;
      const scrollTo = direction === "left" 
        ? scrollLeft - cardWidth 
        : scrollLeft + cardWidth;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!questions || questions.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#FDFBFB] border-t border-stone-200/40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
        
        {/* Section Header */}
        <div className="relative flex flex-col items-center justify-center mb-8 text-center min-h-[72px]">
          <div className="max-w-2xl mx-auto">
            <span className="font-lato text-[11px] font-bold uppercase tracking-widest text-[var(--burgundy)] mb-2 block">
              {lang === "ta" ? "கேள்வி & பதில்" : "COMMUNITY Q&A"}
            </span>
            <h2 className="font-playfair text-[28px] sm:text-[32px] font-bold text-stone-900 leading-tight">
              {lang === "ta" ? "போதகர் கோலின்ஸுடன் கேள்வி-பதில்" : "Questions Answered by Pastor Collins"}
            </h2>
          </div>

          {/* Slider Chevrons */}
          {questions.length > 0 && (
            <div className="absolute right-0 bottom-0 hidden sm:flex items-center gap-2">
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
          className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth"
        >
          {questions.map((q) => {
            // Determine name based on consent
            const displayName = q.consent && q.name ? q.name : (lang === "ta" ? "பெயரிடப்படாதவர்" : "Anonymous");
            
            // Determine translations
            const questionText = lang === "ta" && q.questionTa ? q.questionTa : q.question;
            const answerText = lang === "ta" && q.answerTa ? q.answerTa : q.answer;
            const titleText = lang === "ta" && q.answerTitleTa ? q.answerTitleTa : q.answerTitle;
            
            const dateStr = q.createdAt
              ? new Date(q.createdAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            // Truncation check
            const isLong = answerText.length > 180;
            const displayedAnswer = isLong ? `${answerText.slice(0, 180)}...` : answerText;

            return (
              <div
                key={q._id}
                className="bg-white border border-stone-200/50 rounded-sm p-6 sm:p-7 hover:shadow-md transition-all duration-300 flex flex-col w-[290px] sm:w-[380px] h-[270px] shrink-0 justify-between"
              >
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Card Header (User and Date) */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3 shrink-0">
                    <span className="font-lato text-[12px] font-bold text-[var(--burgundy)] uppercase tracking-wider">
                      {lang === "ta" ? `${displayName} கேட்ட கேள்வி` : `Asked by ${displayName}`}
                    </span>
                    {dateStr && (
                      <time className="font-lato text-[11px] text-stone-400">
                        {dateStr}
                      </time>
                    )}
                  </div>

                  {/* Content Container (Constrained but scroll-free for standard cards) */}
                  <div className="flex-grow space-y-3 pr-1 overflow-hidden">
                    {/* Title (if exists) */}
                    {titleText && (
                      <h3 className="font-playfair text-[16px] font-bold text-stone-900 leading-tight line-clamp-1">
                        {titleText}
                      </h3>
                    )}

                    {/* The Question */}
                    <div className="bg-stone-50 border-l-2 border-[var(--burgundy)] px-4 py-1.5 rounded-r-sm shrink-0">
                      <p className="font-lato text-[12.5px] text-stone-600 italic leading-relaxed line-clamp-2">
                        &ldquo;{questionText}&rdquo;
                      </p>
                    </div>

                    {/* The Answer (Truncated) */}
                    <div className="font-lato text-[13px] text-stone-700 leading-relaxed">
                      {displayedAnswer}
                      {isLong && (
                        <button
                          onClick={() => setActiveQuestion(q)}
                          className="text-[var(--burgundy)] hover:text-[var(--burgundy-dark)] font-bold text-[11.5px] ml-1.5 focus:outline-none transition-colors underline"
                        >
                          {lang === "ta" ? "மேலும் படிக்க" : "Read More"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Modal Details Popup */}
      {activeQuestion && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" 
            onClick={() => setActiveQuestion(null)}
          >
            <div 
              className="bg-white rounded-sm w-full max-w-[600px] p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto" 
              onClick={e => e.stopPropagation()}
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveQuestion(null)} 
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Author & Date */}
              <div className="border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                <span className="font-lato text-[12px] font-bold text-[var(--burgundy)] uppercase tracking-wider">
                  {lang === "ta" 
                    ? `${activeQuestion.consent && activeQuestion.name ? activeQuestion.name : "பெயரிடப்படாதவர்"} கேட்ட கேள்வி` 
                    : `Asked by ${activeQuestion.consent && activeQuestion.name ? activeQuestion.name : "Anonymous"}`}
                </span>
                <span className="text-stone-300">&#8226;</span>
                <time className="font-lato text-[11px] text-stone-400">
                  {new Date(activeQuestion.createdAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", { 
                    month: "short", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                </time>
              </div>

              {/* Title */}
              {((lang === "ta" && activeQuestion.answerTitleTa) || activeQuestion.answerTitle) && (
                <h3 className="font-playfair text-[20px] font-bold text-stone-900 mb-4 leading-snug">
                  {lang === "ta" && activeQuestion.answerTitleTa ? activeQuestion.answerTitleTa : activeQuestion.answerTitle}
                </h3>
              )}

              {/* Question */}
              <div className="bg-stone-50 border-l-2 border-[var(--burgundy)] px-4 py-3 rounded-r-sm mb-5">
                <p className="font-lato text-[13.5px] text-stone-600 italic leading-relaxed">
                  &ldquo;{lang === "ta" && activeQuestion.questionTa ? activeQuestion.questionTa : activeQuestion.question}&rdquo;
                </p>
              </div>

              {/* Answer */}
              <div className="font-lato text-[14px] text-stone-700 leading-relaxed whitespace-pre-wrap pr-1">
                {lang === "ta" && activeQuestion.answerTa ? activeQuestion.answerTa : activeQuestion.answer}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
