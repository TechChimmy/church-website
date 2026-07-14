"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

// SVG icon components
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  About: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Events: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  ),
  AskCollins: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  JoinLive: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
    </svg>
  ),
  ServiceTimes: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  ),
  Community: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Media: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Prayers: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8h1a4 4 0 010 8h-1" />
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  Messages: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Cross: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  Gallery: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Announcements: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a4 4 0 010 7M19 6a8.5 8.5 0 010 12" />
    </svg>
  ),
};

const NAV = [
  { href: "/studio/", translationKey: "cmsStudio", Icon: Icons.ExternalLink, target: "_blank" },
  { href: "/admin", translationKey: "dashboard", Icon: Icons.Dashboard },
  { href: "/admin/homepage", translationKey: "homepage", Icon: Icons.Home },
  { href: "/admin/about", translationKey: "aboutPage", Icon: Icons.About },
  { href: "/admin/events", translationKey: "events", Icon: Icons.Events },
  { href: "/admin/calendar", translationKey: "calendar", Icon: Icons.Calendar },
  { href: "/admin/ask-collins", translationKey: "askCollins", Icon: Icons.AskCollins },
  { href: "/admin/join-us-live", translationKey: "joinUsLive", Icon: Icons.JoinLive },
  { href: "/admin/service-times", translationKey: "serviceTimes", Icon: Icons.ServiceTimes },
  { href: "/admin/community", translationKey: "community", Icon: Icons.Community },
  { href: "/admin/gallery", translationKey: "gallery", Icon: Icons.Gallery },
  { href: "/admin/announcements", translationKey: "announcements", Icon: Icons.Announcements },
  { href: "/admin/media", translationKey: "mediaLibrary", Icon: Icons.Media },
  { href: "/admin/settings", translationKey: "siteSettings", Icon: Icons.Settings },
  { href: "/admin/prayers", translationKey: "prayerRequests", Icon: Icons.Prayers },
  { href: "/admin/messages", translationKey: "contactMessages", Icon: Icons.Messages },
];

export default function AdminSidebar() {
  const { lang, t } = useLanguage();
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-4 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" className="block no-underline group" target="_blank" prefetch={false}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--burgundy)" }}
            >
              <Icons.Cross />
            </div>
            <div>
              <p className="font-playfair text-[12px] font-semibold text-white leading-tight">
                CFT Church
              </p>
              <p className="font-lato text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                {t("admin.adminCms")}
              </p>
            </div>
          </div>
        </Link>
        <button
          className="lg:hidden text-white/40 hover:text-white transition-colors p-1"
          onClick={() => setMobileOpen(false)}
          aria-label={t("admin.closeMenu")}
        >
          <Icons.X />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-2 space-y-0.5">
          {NAV.map(({ href, translationKey, Icon, target }) => {
            const exact = href === "/admin";
            const active = exact ? path === href : path.startsWith(href);
            const label = t(`admin.${translationKey}`);
            return (
              <Link
                key={href}
                href={href}
                target={target}
                rel={target === "_blank" ? "noopener noreferrer" : undefined}
                prefetch={false}
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[12.5px]
                           font-lato no-underline transition-all group relative"
                style={
                  active
                    ? {
                        backgroundColor: "rgba(140,58,99,0.3)",
                        color: "white",
                        fontWeight: 700,
                      }
                    : { color: "rgba(255,255,255,0.5)" }
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                  }
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                    style={{ backgroundColor: "var(--burgundy-secondary)" }}
                  />
                )}
                <span className="shrink-0 opacity-80">
                  <Icon />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 font-lato text-[11px] transition-colors no-underline"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
        >
          <Icons.ExternalLink />
          {t("admin.viewPublicSite")}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-4"
        style={{ backgroundColor: "#0C0C0D", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label={t("admin.openNavigation")}
        >
          <Icons.Menu />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: "var(--burgundy)" }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          <p className="font-playfair text-[13px] font-semibold text-white leading-none">
            {lang === "ta" ? "CFT திருச்சபை நிர்வாகம்" : "CFT Church Admin"}
          </p>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col shrink-0" style={{ backgroundColor: "#0C0C0D" }}>
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col
                   transition-transform duration-300 ease-out lg:hidden`}
        style={{
          backgroundColor: "#0C0C0D",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {navContent}
      </div>
    </>
  );
}
