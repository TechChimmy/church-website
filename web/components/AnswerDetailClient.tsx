"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  answer: {
    _id: string;
    title: string;
    titleTa?: string;
    question: string;
    questionTa?: string;
    answer: string;
    answerTa?: string;
    imageUrl?: string | null;
    category?: string;
    categoryTa?: string;
    publishDate?: string;
    _createdAt?: string;
  };
}

export default function AnswerDetailClient({ answer }: Props) {
  const { lang, t } = useLanguage();

  const title = lang === "ta" && answer.titleTa ? answer.titleTa : answer.title;
  const question = lang === "ta" && answer.questionTa ? answer.questionTa : answer.question;
  const body = lang === "ta" && answer.answerTa ? answer.answerTa : answer.answer;
  const category = lang === "ta" && answer.categoryTa ? answer.categoryTa : answer.category;
  const publishDate = answer.publishDate ?? answer._createdAt;

  const displayDate = publishDate
    ? new Date(publishDate).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article className="flex-1 max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Back Link */}
      <Link
        href="/ask-collins#answers-section"
        className="inline-flex items-center gap-2 font-lato text-[12px] font-bold uppercase tracking-wider text-[var(--burgundy)] hover:text-[var(--burgundy-dark)] transition-colors mb-8 no-underline"
      >
        {lang === "ta" ? "← பதில்களுக்குத் திரும்புக" : "← Back to Answers"}
      </Link>

      {/* Category & Date */}
      <div className="flex items-center gap-3 mb-4">
        {category && (
          <span className="font-lato text-[11px] font-bold uppercase tracking-widest bg-stone-100 text-stone-600 px-2.5 py-1 rounded-sm">
            {category}
          </span>
        )}
        {displayDate && (
          <time className="font-lato text-[12px] text-stone-400">
            {displayDate}
          </time>
        )}
      </div>

      {/* Title / Question */}
      <h1 className="font-playfair text-[28px] sm:text-[36px] font-bold text-stone-900 leading-tight mb-6">
        {title || question}
      </h1>

      {/* Question Text block if title is present */}
      {title && question && title !== question && (
        <div className="bg-stone-50 border-l-4 border-[var(--burgundy)] p-4 mb-8 rounded-r-sm">
          <p className="font-lato text-[14px] text-stone-600 italic leading-relaxed">
            &ldquo;{question}&rdquo;
          </p>
        </div>
      )}

      {/* Featured Image */}
      {answer.imageUrl && (
        <div className="relative w-full h-[280px] sm:h-[420px] rounded-sm overflow-hidden mb-10 shadow-sm border border-stone-100">
          <Image
            src={answer.imageUrl}
            alt={title || "Featured Image"}
            fill
            className="object-cover"
            sizes="(max-width: 800px) 100vw, 800px"
            priority
          />
        </div>
      )}

      {/* Body Content */}
      <div className="font-lato text-[14.5px] sm:text-[16px] text-stone-700 leading-relaxed whitespace-pre-wrap space-y-6">
        {body}
      </div>
    </article>
  );
}
