"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/admin",               label: "Dashboard",       icon: "⊞" },
  { href: "/admin/homepage",      label: "Homepage",         icon: "🏠" },
  { href: "/admin/about",         label: "About Page",       icon: "ℹ" },
  { href: "/admin/events",        label: "Events",           icon: "📅" },
  { href: "/admin/calendar",      label: "Calendar",         icon: "🗓" },
  { href: "/admin/ask-collins",   label: "Ask Collins",      icon: "💬" },
  { href: "/admin/join-us-live",  label: "Join Us Live",     icon: "▶" },
  { href: "/admin/service-times", label: "Service Times",    icon: "⏰" },
  { href: "/admin/community",     label: "Community",        icon: "👥" },
  { href: "/admin/media",         label: "Media Library",    icon: "🖼" },
  { href: "/admin/settings",      label: "Site Settings",    icon: "⚙" },
  { href: "/admin/prayers",         label: "Prayer Requests",  icon: "🙏" },
  { href: "/admin/messages",        label: "Contact Messages", icon: "📩" },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [path]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="block no-underline">
          <p className="font-playfair text-[13px] font-semibold text-white leading-snug">
            Christian Fellowship<br />Church
          </p>
          <p className="font-lato text-[10px] uppercase tracking-widest mt-0.5"
            style={{ color: "var(--burgundy-secondary)" }}>
            Admin CMS
          </p>
        </Link>
        {/* Mobile close button */}
        <button
          className="lg:hidden text-white/60 hover:text-white p-1"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const exact = href === "/admin";
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-[13px] no-underline
                         transition-colors
                         ${active
                           ? "text-white font-bold"
                           : "text-white/60 hover:text-white hover:bg-white/5"}`}
              style={active ? { backgroundColor: "rgba(140,58,99,0.25)" } : undefined}
            >
              <span className="text-[15px] w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <Link href="/" target="_blank"
          className="font-lato text-[11px] text-white/40 hover:text-white/70 transition-colors no-underline">
          ← View public site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar for admin - hamburger trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-stone-950 border-b border-white/10 h-14 flex items-center px-4 gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/70 hover:text-white p-1"
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <p className="font-playfair text-[12px] font-semibold text-white leading-none">
            CFT Church Admin
          </p>
          <p className="font-lato text-[9px] uppercase tracking-widest"
            style={{ color: "var(--burgundy-secondary)" }}>
            CMS
          </p>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-stone-950 flex-col shrink-0">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-stone-950 flex flex-col
                   transition-transform duration-300 lg:hidden
                   ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {navContent}
      </div>
    </>
  );
}
