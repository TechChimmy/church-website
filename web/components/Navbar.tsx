"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home",        href: "/",            scroll: null },
  { label: "About Us",    href: "/about",       scroll: null },
  { label: "Events",      href: "/events",      scroll: null },
  { label: "Ask Collins", href: "/ask-collins", scroll: null },
  { label: "Visit Us",    href: "/",            scroll: "footer-visit" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Handle Visit Us smooth scroll from any page
  function handleVisitUs(e: React.MouseEvent) {
    e.preventDefault();
    const doScroll = () => {
      const el = document.getElementById("footer-visit");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    if (pathname === "/") {
      doScroll();
    } else {
      router.push("/?scrollTo=footer-visit");
    }
    setMenuOpen(false);
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 bg-white border-b transition-shadow duration-300"
        style={{
          borderBottomColor: "rgba(140,58,99,0.12)",
          boxShadow: scrolled ? "0 1px 16px rgba(140,58,99,0.10)" : "none",
        }}
      >
        <div className="h-[56px] flex items-center px-4 sm:px-10 max-w-[1280px] mx-auto w-full justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0 group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: "var(--burgundy)" }}
            >
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="none"
                stroke="white" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <span className="font-playfair text-[13px] font-semibold leading-snug" style={{ color: "var(--text-dark)" }}>
              Christian Fellowship<br />Church
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href, scroll }) => {
              const isActive = label === "Home"
                ? pathname === "/"
                : pathname.startsWith(href) && href !== "/";
              if (scroll === "footer-visit") {
                return (
                  <button key={label}
                    onClick={handleVisitUs}
                    suppressHydrationWarning
                    className="font-lato text-[12px] uppercase tracking-widest no-underline transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
                    style={{
                      color: "#6B5B63",
                      fontWeight: 400,
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--burgundy)"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = "#6B5B63"; }}
                  >
                    {label}
                  </button>
                );
              }
              return (
                <Link key={label} href={href}
                  className="font-lato text-[12px] uppercase tracking-widest no-underline transition-colors duration-200"
                  style={{
                    color: isActive ? "var(--burgundy)" : "#6B5B63",
                    fontWeight: isActive ? 700 : 400,
                  }}
                  onMouseEnter={e => { if (!isActive) (e.target as HTMLElement).style.color = "var(--burgundy)"; }}
                  onMouseLeave={e => { if (!isActive) (e.target as HTMLElement).style.color = "#6B5B63"; }}
                >
                  {label}
                </Link>
              );
            })}
            <Link href="/admin/login"
              className="font-lato text-[12px] uppercase tracking-widest no-underline transition-colors duration-200"
              style={{
                color: pathname === "/admin/login" ? "var(--burgundy)" : "#6B5B63",
                fontWeight: pathname === "/admin/login" ? 700 : 400,
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--burgundy)"; }}
              onMouseLeave={e => { if (pathname !== "/admin/login") (e.target as HTMLElement).style.color = "#6B5B63"; }}
            >
              Admin Login
            </Link>
            <Link href="/join-us-live"
              className="font-lato text-[11px] uppercase tracking-widest px-4 py-[8px] rounded-sm no-underline
                         transition-all duration-200 will-change-transform"
              style={{
                backgroundColor: pathname === "/join-us-live" ? "var(--burgundy-dark)" : "var(--burgundy)",
                color: "white",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--burgundy-dark)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(140,58,99,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = pathname === "/join-us-live" ? "var(--burgundy-dark)" : "var(--burgundy)";
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              Join Us Live
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            suppressHydrationWarning
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-[2px] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
              style={{ backgroundColor: "var(--burgundy)" }} />
            <span className={`block w-5 h-[2px] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              style={{ backgroundColor: "var(--burgundy)" }} />
            <span className={`block w-5 h-[2px] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
              style={{ backgroundColor: "var(--burgundy)" }} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-[56px] left-0 right-0 z-40 bg-white border-b
                   shadow-lg transition-all duration-300 md:hidden
                   ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{ borderBottomColor: "rgba(140,58,99,0.12)" }}
      >
        <div className="flex flex-col py-4">
          {NAV_LINKS.map(({ label, href, scroll }) => {
            const isActive = label === "Home"
              ? pathname === "/"
              : pathname.startsWith(href) && href !== "/";
            if (scroll === "footer-visit") {
              return (
                <button key={label}
                  onClick={handleVisitUs}
                  suppressHydrationWarning
                  className="font-lato text-[13px] uppercase tracking-widest px-6 py-4 no-underline
                             transition-colors duration-200 border-b border-stone-100 text-left bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer"
                  style={{
                    color: "#4A3540",
                    fontWeight: 400,
                  }}
                >
                  {label}
                </button>
              );
            }
            return (
              <Link key={label} href={href}
                onClick={() => setMenuOpen(false)}
                className="font-lato text-[13px] uppercase tracking-widest px-6 py-4 no-underline
                           transition-colors duration-200 border-b border-stone-100 last:border-0"
                style={{
                  color: isActive ? "var(--burgundy)" : "#4A3540",
                  fontWeight: isActive ? 700 : 400,
                  backgroundColor: isActive ? "rgba(140,58,99,0.04)" : "",
                }}
              >
                {label}
              </Link>
            );
          })}
          <Link href="/admin/login"
            onClick={() => setMenuOpen(false)}
            className="font-lato text-[13px] uppercase tracking-widest px-6 py-4 no-underline
                       transition-colors duration-200 border-b border-stone-100"
            style={{
              color: pathname === "/admin/login" ? "var(--burgundy)" : "#4A3540",
              fontWeight: pathname === "/admin/login" ? 700 : 400,
              backgroundColor: pathname === "/admin/login" ? "rgba(140,58,99,0.04)" : "",
            }}
          >
            Admin Login
          </Link>
          <div className="px-6 pt-4 pb-2">
            <Link href="/join-us-live" onClick={() => setMenuOpen(false)}
              className="block text-center font-lato text-[12px] uppercase tracking-widest px-4 py-3 rounded-sm no-underline transition-all duration-200"
              style={{ backgroundColor: "var(--burgundy)", color: "white" }}
            >
              Join Us Live
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
