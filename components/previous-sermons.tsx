"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import VideoModal from "@/components/video-modal";
import type { YouTubeVideo } from "@/types/youtube";

interface Props {
  sermons: YouTubeVideo[];
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return "";
  }
}

/* Fallback card when no real data */
function PlaceholderCard({ index }: { index: number }) {
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
          Sermon {index + 1}
        </span>
      </div>
    </div>
  );
}

export default function PreviousSermons({ sermons }: Props) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

  return (
    <section className="py-8 sm:py-10 px-4 sm:px-10 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <h3 className="font-playfair text-[20px] font-semibold text-stone-900 mb-5">
          Previous Sermons
        </h3>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {sermons.length > 0
            ? sermons.map((sermon, i) => (
                <motion.div
                  key={sermon.videoId}
                  className="relative rounded-lg overflow-hidden cursor-pointer group bg-stone-200"
                  style={{ aspectRatio: "16/9" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  onClick={() => setActiveVideo(sermon)}
                  role="button"
                  aria-label={`Play: ${sermon.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActiveVideo(sermon)}
                >
                  {/* Thumbnail */}
                  <Image
                    src={sermon.thumbnail}
                    alt={sermon.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width:768px) 50vw, 25vw"
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
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70
                                  to-transparent px-2 py-2 z-10">
                    <p className="font-lato text-[10px] text-white font-bold truncate leading-tight">
                      {sermon.title}
                    </p>
                    <p className="font-lato text-[9px] text-white/60">
                      {formatDate(sermon.publishedAt)}
                    </p>
                  </div>
                </motion.div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={i} index={i} />
              ))
          }
        </div>
      </div>

      {/* Video modal */}
      <VideoModal
        videoId={activeVideo?.videoId ?? null}
        title={activeVideo?.title ?? ""}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
