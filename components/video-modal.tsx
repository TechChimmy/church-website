"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  videoId: string | null;
  title: string;
  onClose: () => void;
}

export default function VideoModal({ videoId, title, onClose }: Props) {
  /* Close on ESC */
  useEffect(() => {
    if (!videoId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [videoId, onClose]);

  return (
    <AnimatePresence>
      {videoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="relative w-full max-w-[800px] z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="font-lato text-[13px] text-white/70 truncate pr-4">{title}</p>
              <button
                onClick={onClose}
                aria-label="Close video"
                className="text-white/60 hover:text-white transition-colors text-2xl leading-none shrink-0"
              >
                ×
              </button>
            </div>

            {/* 16:9 embed */}
            <div className="relative w-full bg-black rounded-sm overflow-hidden shadow-2xl"
                 style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
