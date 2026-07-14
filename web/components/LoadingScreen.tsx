"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show the loading screen on every route/page transition
    setShow(true);
    document.body.style.overflow = "hidden";
    
    // Snappy transition timer (0.9s draw sequence + 0.3s fadeout buffer)
    const timer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 1200);
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]"
        >
          <div className="flex flex-col items-center select-none">
            {/* Elegant SVG Cross drawing */}
            <svg
              width="80"
              height="120"
              viewBox="0 0 80 120"
              fill="none"
              stroke="#8c3a63"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="mb-4"
            >
              {/* Vertical line: from top (y=15) to bottom (y=105) */}
              <motion.line
                x1="40"
                y1="15"
                x2="40"
                y2="105"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
              />
              {/* Horizontal line: from left (x=18) to right (x=62) at y=42 */}
              <motion.line
                x1="18"
                y1="42"
                x2="62"
                y2="42"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.55, ease: "easeInOut" }}
              />
              {/* Soft intersection center glow */}
              <motion.circle
                cx="40"
                cy="42"
                r="5"
                fill="#8c3a63"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.4, 0.25], scale: [0, 2.5, 1.8] }}
                transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
              />
            </svg>

            {/* Logo text */}
            <motion.h1
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
              className="font-playfair text-[13.5px] font-bold tracking-[0.08em] text-stone-800 uppercase text-center mb-1"
            >
              Christian Fellowship
            </motion.h1>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.65, duration: 0.45 }}
              className="font-lato text-[9px] font-bold tracking-[0.3em] text-stone-600 uppercase text-center"
            >
              Church
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
