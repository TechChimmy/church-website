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
            {/* Elegant Logo Animation */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {/* Background Glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 0.15, 0.05, 0.15, 0],
                  scale: [0.8, 1.2, 1.0, 1.3, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  times: [0, 0.35, 0.6, 0.85, 1.0],
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: "var(--burgundy)" }}
              />
              
              {/* Logo Image */}
              <motion.img
                src="/cft_logo.png"
                alt="CFT Logo"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{
                  opacity: 1,
                  scale: [0.5, 1.1, 1.0, 1.03, 1.0],
                  rotate: 0,
                }}
                transition={{
                  duration: 1.1,
                  times: [0, 0.4, 0.7, 0.9, 1.0],
                  ease: "easeOut",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>

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
