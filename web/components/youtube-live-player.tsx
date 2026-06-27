"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import type { YouTubeVideo } from "@/types/youtube";

interface Props {
  video: YouTubeVideo | null;
  embedUrl: string;
  watchUrl: string;
  isLive: boolean;
}

export default function YouTubeLivePlayer({
  video,
  embedUrl,
  watchUrl,
  isLive,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    // Automatically check for YouTube live stream updates by requesting fresh Server Component payload every 10s.
    // Next.js reconciliation keeps the same iframe element if src/embedUrl doesn't change, preventing playback disruption.
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  /* Fallback when no video could be fetched */
  if (!video) {
    return (
      <div className="w-full bg-stone-200 rounded-lg flex items-center justify-center"
           style={{ aspectRatio: "16/9" }}>
        <p className="font-lato text-[13px] text-stone-500 uppercase tracking-widest">
          No video available
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full relative rounded-lg overflow-hidden bg-stone-900 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* 16:9 iframe wrapper */}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Bottom bar — live badge + YouTube logo + Watch button */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-950">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="font-lato text-[10px] font-bold uppercase tracking-widest
                             bg-red-600 text-white px-2 py-0.5 rounded-sm">
              ● Live
            </span>
          )}
          <p className="font-lato text-[12px] text-white/60 truncate max-w-[260px]">
            {video.title}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* YouTube logo */}
          <svg viewBox="0 0 90 20" className="h-4 fill-white/70" aria-label="YouTube">
            <path d="M27.97 3.2c-.33-1.23-1.3-2.2-2.53-2.53C23.25 0 14.33 0 14.33 0S5.42 0 3.22.67C1.99 1 1.02 1.97.69 3.2 0 5.42 0 10 0 10s0 4.58.69 6.8c.33 1.23 1.3 2.2 2.53 2.53C5.42 20 14.33 20 14.33 20s8.92 0 11.11-.67c1.23-.33 2.2-1.3 2.53-2.53C28.67 14.58 28.67 10 28.67 10s0-4.58-.7-6.8zm-16.57 10.95V5.85l7.42 4.15-7.42 4.15z"/>
            <path d="M36.5 13.6l-2.3-8.5h1.9l1.4 5.7 1.4-5.7h1.9l-2.3 8.5v5.4h-1.9v-5.4zm8.5 5.6c-2.3 0-3.5-1.4-3.5-4.1v-2.3c0-2.7 1.2-4.1 3.5-4.1s3.5 1.4 3.5 4.1v2.3c0 2.7-1.2 4.1-3.5 4.1zm1.7-6.5c0-1.6-.5-2.4-1.7-2.4s-1.7.8-1.7 2.4v2.5c0 1.6.5 2.4 1.7 2.4s1.7-.8 1.7-2.4v-2.5zm7.3 6.3l-.2-1.1c-.5.8-1.2 1.3-2.1 1.3-1.3 0-2-.9-2-2.4V8.9h1.8v7.6c0 .7.3 1 .8 1 .6 0 1.1-.4 1.5-1.1V8.9h1.8v10.1H54zm7.1.2c-.8 0-1.5-.3-2-1v4.5h-1.8V8.9H59l.1 1c.5-.8 1.2-1.2 2.1-1.2 1.5 0 2.3 1.1 2.3 3.3v3.2c0 2.3-.8 3.4-2.3 3.4zm-.4-7.9c-.6 0-1.1.4-1.5 1.1v5c.4.7.9 1 1.5 1 .8 0 1.1-.6 1.1-1.8v-3.4c0-1.2-.4-1.9-1.1-1.9zm9.5 7.7l-.1-1c-.5.8-1.3 1.2-2.2 1.2-1.3 0-2-.9-2-2.4V8.9h1.8v7.6c0 .7.3 1 .8 1 .6 0 1.1-.4 1.5-1.1V8.9h1.8v10.1H70.2zm7.2.2c-2.1 0-3.3-1.3-3.3-4V12c0-2.7 1.2-4.2 3.3-4.2 2.2 0 3.3 1.5 3.3 4v1.7h-4.7v1c0 1.5.6 2.3 1.5 2.3.8 0 1.3-.5 1.4-1.5h1.8c-.2 2-1.3 3-3.3 3zm1.4-6.9c0-1.5-.5-2.2-1.4-2.2-.9 0-1.4.8-1.4 2.2v.7h2.9v-.7z"/>
          </svg>

          {/* Watch on YouTube */}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-lato text-[10px] font-bold uppercase tracking-[1px]
                       bg-stone-800 text-white/80 px-3 py-1.5 rounded-sm
                       hover:bg-[var(--burgundy)] hover:text-stone-900 transition-colors
                       whitespace-nowrap no-underline"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </motion.div>
  );
}
