"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

interface Counts {
  eventCount: number;
  questionCount: number;
  testimonialCount: number;
  messageCount: number;
  prayerCount: number;
  mediaCount: number;
  galleryCount: number;
  announcementCount: number;
}

interface Props {
  counts: Counts;
  sessionName: string;
}

export default function AdminDashboardClient({ counts, sessionName }: Props) {
  const { t } = useLanguage();

  const NAV_CARDS = [
    { href: "/studio/",               translationKey: "cmsStudio",       icon: "📝", descKey: "cmsStudioDesc", target: "_blank" },
    { href: "/admin/homepage",      translationKey: "homepage",        icon: "🏠", descKey: "homepageDesc" },
    { href: "/admin/events",        translationKey: "events",          icon: "📅", descKey: "eventsDesc" },
    { href: "/admin/calendar",      translationKey: "calendar",        icon: "🗓", descKey: "calendarDesc" },
    { href: "/admin/prayers",       translationKey: "prayerRequests",  icon: "🙏", descKey: "prayerDesc" },
    { href: "/admin/ask-collins",   translationKey: "askCollins",      icon: "💬", descKey: "askCollinsDesc" },
    { href: "/admin/about",         translationKey: "aboutPage",       icon: "ℹ",  descKey: "aboutDesc" },
    { href: "/admin/join-us-live",  translationKey: "joinUsLive",     icon: "▶",  descKey: "joinLiveDesc" },
    { href: "/admin/service-times", translationKey: "serviceTimes",    icon: "⏰", descKey: "serviceTimesDesc" },
    { href: "/admin/community",     translationKey: "community",        icon: "👥", descKey: "communityDesc" },
    { href: "/admin/gallery",       translationKey: "gallery",          icon: "🖼", descKey: "galleryDesc" },
    { href: "/admin/announcements", translationKey: "announcements",    icon: "📢", descKey: "announcementsDesc" },
    { href: "/admin/media",         translationKey: "mediaLibrary",    icon: "📂", descKey: "mediaDesc" },
    { href: "/admin/settings",      translationKey: "siteSettings",    icon: "⚙",  descKey: "settingsDesc" },
    { href: "/admin/messages",      translationKey: "contactMessages", icon: "📩", descKey: "messagesDesc" },
  ];

  const stats = [
    { label: t("admin.activeEvents"),     value: counts.eventCount,       href: "/admin/events",       urgent: false },
    { label: t("admin.pendingQuestions"), value: counts.questionCount,    href: "/admin/ask-collins",  urgent: counts.questionCount > 0 },
    { label: t("admin.unreadMessages"),   value: counts.messageCount,     href: "/admin/messages",     urgent: counts.messageCount > 0 },
    { label: t("admin.unreadPrayers"),    value: counts.prayerCount,      href: "/admin/prayers",      urgent: counts.prayerCount > 0 },
    { label: t("admin.galleryImages"),    value: counts.galleryCount,     href: "/admin/gallery",      urgent: false },
    { label: t("admin.announcements"),    value: counts.announcementCount, href: "/admin/announcements", urgent: false },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-playfair text-[26px] font-bold" style={{ color: "var(--text-dark)" }}>
          {t("admin.welcomeBack")} {sessionName}
        </h1>
        <p className="font-lato text-[13px] mt-1" style={{ color: "#9B8A90" }}>
          {t("admin.manageContent")}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            prefetch={false}
            className="rounded-sm px-4 py-4 no-underline block transition-shadow hover:shadow-md"
            style={{
              backgroundColor: s.urgent ? "var(--burgundy)" : "white",
              border: s.urgent ? "none" : "1px solid rgba(140,58,99,0.1)",
              boxShadow: s.urgent
                ? "0 4px 20px rgba(140,58,99,0.25)"
                : "0 2px 8px rgba(140,58,99,0.04)",
            }}
          >
            <p
              className="font-lato text-[9px] font-bold uppercase tracking-widest mb-1.5"
              style={{ color: s.urgent ? "rgba(255,255,255,0.65)" : "#9B8A90" }}
            >
              {s.label}
            </p>
            <p
              className="font-playfair text-[28px] font-bold leading-none"
              style={{ color: s.urgent ? "white" : "var(--text-dark)" }}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1" style={{ backgroundColor: "rgba(140,58,99,0.1)" }} />
        <p className="font-lato text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9B8A90" }}>
          {t("admin.sections")}
        </p>
        <div className="h-px flex-1" style={{ backgroundColor: "rgba(140,58,99,0.1)" }} />
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {NAV_CARDS.map(c => (
          <Link
            key={c.href}
            href={c.href}
            target={c.target}
            rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
            prefetch={false}
            className="bg-white rounded-sm px-5 py-4 no-underline block
                       transition-all hover:shadow-md group"
            style={{ border: "1px solid rgba(140,58,99,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0 text-[18px]"
                style={{ backgroundColor: "rgba(140,58,99,0.07)" }}
              >
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-lato font-bold text-[13px] leading-tight
                             group-hover:text-[var(--burgundy)] transition-colors"
                  style={{ color: "var(--text-dark)" }}
                >
                  {t(`admin.${c.translationKey}`)}
                </p>
                <p className="font-lato text-[11px] mt-0.5 truncate" style={{ color: "#9B8A90" }}>
                  {t(`admin.${c.descKey}`)}
                </p>
              </div>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none" stroke="var(--burgundy)" strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
