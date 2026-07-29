"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import VideoModal from "@/components/video-modal";
import type { YouTubeVideo } from "@/types/youtube";
import { useLanguage } from "@/hooks/useLanguage";

type JoinVisitProps = {
  joinUsText: string;
  joinUsTextTa?: string;
  visitUsText: string;
  visitUsTextTa?: string;
  visitUsBtnText?: string;
  visitUsBtnTextTa?: string;
  visitUsBtnLink?: string;
  mainVideo: YouTubeVideo | null;
};

export default function JoinVisit({
  joinUsText,
  joinUsTextTa,
  visitUsText,
  visitUsTextTa,
  visitUsBtnText,
  visitUsBtnTextTa,
  visitUsBtnLink,
  mainVideo
}: JoinVisitProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  // Smoothly scroll to the Footer section (id="footer-visit") instead of
  // navigating — mirrors the existing "Visit Us" handler in Navbar.tsx.
  function handleGetDirections(e: React.MouseEvent) {
    e.preventDefault();
    const el = document.getElementById("footer-visit");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/?scrollTo=footer-visit");
    }
  }

  const activeJoinText = lang === "ta" && joinUsTextTa ? joinUsTextTa : joinUsText;
  const activeVisitText = lang === "ta" && visitUsTextTa ? visitUsTextTa : visitUsText;

  const defaultCta = lang === "ta" ? "திசைகளைப் பெறுக" : "Get Directions";
  const customCta = lang === "ta" && visitUsBtnTextTa ? visitUsBtnTextTa : visitUsBtnText;
  const activeCta = customCta || defaultCta;

  const hasCustomLink = visitUsBtnLink && visitUsBtnLink.trim() !== "";
  const activeHref = hasCustomLink ? visitUsBtnLink!.trim() : "/";
  const activeOnClick = hasCustomLink ? undefined : handleGetDirections;
  const target = hasCustomLink ? "_blank" : undefined;
  const rel = hasCustomLink ? "noopener noreferrer" : undefined;

  const cards = [
    { title: t("joinVisit.joinTitle"), body: activeJoinText,  cta: t("joinVisit.watchNow"),       href: "/join-us-live", onClick: undefined, target: undefined, rel: undefined },
    { title: t("joinVisit.visitTitle"),     body: activeVisitText, cta: activeCta,  href: activeHref,              onClick: activeOnClick, target, rel },
  ];

  return (
    <>
      <div className="flex flex-col sm:grid sm:[grid-template-columns:180px_1fr_1fr] bg-white"
        style={{ borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
        {/* Thumbnail */}
        <div 
          suppressHydrationWarning
          onClick={mainVideo ? () => setIsPlaying(true) : undefined}
          className={`relative min-h-[100px] sm:min-h-[130px] flex items-center justify-center overflow-hidden ${
            mainVideo ? "cursor-pointer group" : ""
          }`}
          style={{ background: "linear-gradient(135deg, #3D1126, #6D2C4E)" }}
          role={mainVideo ? "button" : undefined}
          aria-label={mainVideo ? `${t("joinVisit.watchNow")}: ${mainVideo.title}` : undefined}
          tabIndex={mainVideo ? 0 : undefined}
          onKeyDown={mainVideo ? (e) => e.key === "Enter" && setIsPlaying(true) : undefined}
        >
          {mainVideo && (
            <Image
              src={mainVideo.thumbnail}
              alt={mainVideo.title}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 180px"
            />
          )}
          {mainVideo && <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />}

          {/* Play Circle */}
          <div className={`relative z-10 w-10 h-10 rounded-full border-2 border-white/70 bg-black/40 flex items-center justify-center transition-transform duration-200 ${
            mainVideo ? "group-hover:scale-110" : ""
          }`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Cards */}
        {cards.map((card, i) => (
          <div key={card.title}
            className="px-6 sm:px-8 py-6 sm:py-7 group"
            style={{
              borderTop: "1px solid rgba(140,58,99,0.1)",
              borderLeft: i === 0 ? "1px solid rgba(140,58,99,0.1)" : undefined,
              ...(i > 0 ? { borderLeft: "1px solid rgba(140,58,99,0.1)" } : {}),
            }}>
            <div className="w-5 h-[2px] rounded-full mb-3 transition-all duration-200 group-hover:w-8"
              style={{ backgroundColor: "var(--burgundy)" }} />
            <h3 className="font-playfair text-[17px] sm:text-[19px] font-semibold mb-2"
              style={{ color: "var(--text-dark)" }}>
              {card.title}
            </h3>
            <p className="font-lato text-[13px] leading-relaxed mb-4" style={{ color: "#8A7078" }}>
              {card.body}
            </p>
            <a href={card.href} onClick={card.onClick} target={card.target} rel={card.rel} className="btn-dark">{card.cta}</a>
          </div>
        ))}
      </div>

      {mainVideo && isPlaying && (
        <VideoModal
          videoId={mainVideo.videoId}
          title={mainVideo.title}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </>
  );
}
