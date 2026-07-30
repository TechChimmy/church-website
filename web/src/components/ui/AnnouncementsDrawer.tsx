"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { AnimatePresence, motion } from "framer-motion";

type Announcement = {
  id: string;
  title: string;
  titleTa?: string;
  content: string;
  contentTa?: string;
  date: string | null;
  active: boolean;
};

const READ_KEY = "cft-announcements-read-time";

export default function AnnouncementsDrawer() {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch active announcements
  useEffect(() => {
    fetch("/api/cms/announcements?active=true")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
          });
          setAnnouncements(sorted);
          checkUnreadStatus(sorted);
        }
      })
      .catch((err) => console.error("Error fetching announcements:", err));
  }, []);

  const checkUnreadStatus = (items: Announcement[]) => {
    if (items.length === 0) {
      setHasUnread(false);
      return;
    }
    const lastRead = localStorage.getItem(READ_KEY);
    if (!lastRead) {
      setHasUnread(true);
      return;
    }
    const newestTime = items[0].date ? new Date(items[0].date).getTime() : 0;
    setHasUnread(newestTime > parseInt(lastRead, 10));
  };

  // Open & mark as read
  const toggleDrawer = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && announcements.length > 0) {
        // Mark all as read by saving current time
        const now = Date.now();
        localStorage.setItem(READ_KEY, now.toString());
        setHasUnread(false);
      }
      return next;
    });
  };

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (lang === "ta") {
      // Simple Tamil date formatting helper
      const monthsTa = [
        "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
        "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"
      ];
      return `${date.getDate()} ${monthsTa[date.getMonth()]} ${date.getFullYear()}`;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div ref={containerRef} className="relative z-50 flex items-center">
      {/* Bell Icon Trigger */}
      <button
        onClick={toggleDrawer}
        aria-label={t("announcements") || "Announcements"}
        suppressHydrationWarning={true}
        className="relative p-2 rounded-full focus:outline-none transition-all duration-200 hover:bg-stone-100/50 active:scale-95"
        style={{ cursor: "pointer", border: "none", background: "transparent" }}
      >
        {/* SVG Bell */}
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px] transition-transform duration-300"
          style={{
            fill: isOpen ? "var(--burgundy)" : "none",
            stroke: isOpen ? "var(--burgundy)" : "#65535e",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Pulse red dot for unread */}
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Announcements Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Panel Card */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-16 md:top-10 md:w-[360px] max-h-[480px] rounded-xl shadow-2xl border flex flex-col z-50 overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(18px)",
                borderColor: "rgba(140,58,99,0.12)",
                boxShadow: "0 10px 30px rgba(140,58,99,0.08)",
              }}
            >
              {/* Panel Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b shrink-0"
                style={{ borderColor: "rgba(140,58,99,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-playfair font-bold" style={{ color: "var(--text-dark)" }}>
                    {lang === "ta" ? "அறிவிப்புகள்" : "Announcements"}
                  </span>
                  {announcements.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-amber-600">
                      {announcements.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-stone-600 transition-colors font-lato text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{ background: "none", border: "none" }}
                >
                  {lang === "ta" ? "மூடு" : "Close"}
                </button>
              </div>

              {/* Panel Content List */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                {announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-stone-400">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-10 h-10 stroke-stone-300 stroke-[1.5] mb-2 fill-none"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <p className="font-lato text-[12px]">
                      {lang === "ta"
                        ? "அறிவிப்புகள் எதுவும் இல்லை."
                        : "No announcements at this time."}
                    </p>
                  </div>
                ) : (
                  announcements.map((item, idx) => {
                    const title = lang === "ta" && item.titleTa ? item.titleTa : item.title;
                    const content = lang === "ta" && item.contentTa ? item.contentTa : item.content;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col pb-3 border-b last:border-0 last:pb-0"
                        style={{ borderColor: "rgba(140,58,99,0.06)" }}
                      >
                        {/* Title and Date */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className="font-playfair text-[13px] font-bold leading-snug text-stone-800">
                            {title}
                          </h4>
                          <span className="font-lato text-[9px] text-stone-400 whitespace-nowrap pt-0.5">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        {/* Content */}
                        <p className="font-lato text-[11.5px] leading-relaxed text-stone-600">
                          {content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
