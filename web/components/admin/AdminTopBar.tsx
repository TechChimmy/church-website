"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";

interface Props {
  user: { name?: string | null; email?: string | null };
  onMenuToggle?: () => void;
}

function pageTitleFromPath(path: string, t: any): string {
  const map: Record<string, string> = {
    "/admin": t("admin.dashboard"),
    "/admin/homepage": t("admin.homepage"),
    "/admin/about": t("admin.aboutPage"),
    "/admin/events": t("admin.events"),
    "/admin/ask-collins": t("admin.askCollins"),
    "/admin/join-us-live": t("admin.joinUsLive"),
    "/admin/service-times": t("admin.serviceTimes"),
    "/admin/community": t("admin.community"),
    "/admin/media": t("admin.mediaLibrary"),
    "/admin/settings": t("admin.siteSettings"),
    "/admin/prayers": t("admin.prayerRequests"),
    "/admin/messages": t("admin.contactMessages"),
    "/admin/gallery": t("admin.gallery"),
    "/admin/announcements": t("admin.announcements"),
  };
  return map[path] ?? "Admin";
}

export default function AdminTopBar({ user, onMenuToggle }: Props) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const pathname = usePathname();
  const displayName = session?.user?.name ?? session?.user?.email ?? user.name ?? user.email ?? "Admin";
  const pageTitle = pageTitleFromPath(pathname ?? "", t);

  return (
    <header
      className="h-14 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3"
      style={{ borderBottom: "1px solid rgba(140,58,99,0.1)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Hamburger toggle */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
        className="flex items-center justify-center w-8 h-8 rounded-[6px] transition-colors shrink-0"
        style={{ color: "#7A6570" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
      >
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page title */}
      <p className="font-playfair text-[16px] font-bold flex-1 hidden sm:block" style={{ color: "var(--text-dark)" }}>
        {pageTitle}
      </p>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <LanguageToggle />

        {/* User chip */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm"
          style={{ backgroundColor: "rgba(140,58,99,0.06)", border: "1px solid rgba(140,58,99,0.1)" }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
            style={{ backgroundColor: "var(--burgundy)" }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="font-lato text-[12px] truncate max-w-[140px]" style={{ color: "#7A6570" }}>
            {displayName}
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          prefetch={false}
          className="font-lato text-[10px] font-bold uppercase tracking-widest
                     px-3 py-1.5 rounded-sm transition-colors no-underline whitespace-nowrap
                     flex items-center gap-1.5"
          style={{ border: "1px solid rgba(140,58,99,0.15)", color: "var(--burgundy)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(140,58,99,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {t("admin.site")}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="font-lato text-[10px] font-bold uppercase tracking-widest
                     px-3 py-1.5 rounded-sm transition-all whitespace-nowrap"
          style={{ backgroundColor: "var(--text-dark)", color: "white" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--text-dark)"; }}
        >
          {t("admin.signOut")}
        </button>
      </div>
    </header>
  );
}
