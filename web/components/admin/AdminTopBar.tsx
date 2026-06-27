"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

interface Props {
  user: { name?: string | null; email?: string | null };
}

function pageTitleFromPath(path: string): string {
  const map: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/homepage": "Homepage",
    "/admin/about": "About Page",
    "/admin/events": "Events",
    "/admin/calendar": "Calendar",
    "/admin/ask-collins": "Ask Collins",
    "/admin/join-us-live": "Join Us Live",
    "/admin/service-times": "Service Times",
    "/admin/community": "Community",
    "/admin/media": "Media Library",
    "/admin/settings": "Site Settings",
    "/admin/prayers": "Prayer Requests",
    "/admin/messages": "Contact Messages",
  };
  return map[path] ?? "Admin";
}

export default function AdminTopBar({ user }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const displayName = session?.user?.name ?? session?.user?.email ?? user.name ?? user.email ?? "Admin";
  const pageTitle = pageTitleFromPath(pathname ?? "");

  return (
    <header
      className="h-14 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0"
      style={{ borderBottom: "1px solid rgba(140,58,99,0.1)" }}
    >
      {/* Page title */}
      <p className="font-playfair text-[16px] font-bold hidden sm:block" style={{ color: "var(--text-dark)" }}>
        {pageTitle}
      </p>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
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
          Site
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="font-lato text-[10px] font-bold uppercase tracking-widest
                     px-3 py-1.5 rounded-sm transition-all whitespace-nowrap"
          style={{ backgroundColor: "var(--text-dark)", color: "white" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--text-dark)"; }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
