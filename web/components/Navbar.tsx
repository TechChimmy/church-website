"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";
import AnnouncementsDrawer from "@/components/AnnouncementsDrawer";

const NAV_LINKS = [
  { key: "home",        href: "/",            scroll: null },
  { key: "about",       href: "/about",       scroll: null },
  { key: "events",      href: "/events",      scroll: null },
  { key: "askCollins",  href: "/ask-collins", scroll: null },
  { key: "visitUs",     href: "/",            scroll: "footer-visit" },
];

// Heights used in multiple places
const FULL_NAV_H    = 48;   // px — floating island height
const FULL_MARGIN_T = 8;    // px — gap from viewport top
const DRAWER_TOP    = FULL_MARGIN_T + FULL_NAV_H; // 56px — where mobile drawer starts

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { t }    = useLanguage();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [scrollDir,  setScrollDir]  = useState<"up" | "down">("up");
  const [isDesktop,  setIsDesktop]  = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const lastY = useRef(0);

  const compact     = isDesktop && scrolled && scrollDir === "down";
  const isCollapsed = compact && !navHovered;

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < 4) return;
      setScrollDir(y > lastY.current ? "down" : "up");
      setScrolled(y > 90);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleVisitUs(e: React.MouseEvent) {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById("footer-visit")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/?scrollTo=footer-visit");
    }
    setMenuOpen(false);
  }

  /* ── Derived values ── */

  /* ── Full navbar gradient ──────────────────────────────────────── */

  // The gradient border technique: background has two layers —
  //   1. content fill (padding-box):  the tinted gradient
  //   2. border layer (border-box):   the coloured gradient border
  // Then border is set to transparent so the border-box layer shows through.

  const navBg = isCollapsed
    ? "linear-gradient(135deg, #4a1630 0%, #7a2f54 45%, #a04a74 100%)"
    : scrolled || compact
      ? "rgba(255, 255, 255, 0.85)"
      : "rgba(255, 255, 255, 0.65)"; // beautiful translucent white glass at top

  // Border: clean neutral light grey for the white full-size state, white-tinted for the pill
  const border = isCollapsed
    ? "1px solid rgba(255,255,255,0.16)"
    : scrolled
      ? "1px solid rgba(0, 0, 0, 0.08)"
      : "1px solid rgba(0, 0, 0, 0.05)";

  const navBackdrop = isCollapsed
    ? "blur(16px) saturate(160%)"
    : scrolled || compact
      ? "blur(24px) saturate(190%)"
      : "blur(20px) saturate(160%)"; // glassmorphism blur always active to show underlying content

  const navShadow = isCollapsed
    ? "0 10px 40px rgba(60,15,38,0.45), 0 2px 12px rgba(140,58,99,0.30)"
    : scrolled || compact
      ? "0 4px 24px rgba(0,0,0,0.08)"
      : "0 2px 12px rgba(0,0,0,0.04)";

  // Icon
  const iconBg     = isCollapsed ? "rgba(255,255,255,0.18)" : "linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-dark) 100%)";
  const iconBorder = isCollapsed ? "1.5px solid rgba(255,255,255,0.30)" : "none";
  const iconShadow = isCollapsed ? "none" : "0 2px 12px rgba(140,58,99,0.30)";

  // Text
  const nameColor     = isCollapsed ? "rgba(255,255,255,0.97)" : "var(--text-dark)";
  const subtitleColor = isCollapsed ? "rgba(255,255,255,0.65)" : "var(--burgundy)";

  // Shape: both full and compact are "islands" — same margin-left, both rounded
  // Full: full-width minus 32px margin (16px each side), border-radius 14px
  // Compact: 240px, border-radius 23px
  const navWidth        = isCollapsed ? "240px"  : "calc(100% - 32px)";
  const navHeight       = isCollapsed ? "46px"   : `${FULL_NAV_H}px`;
  const navMarginTop    = isCollapsed ? "10px"   : `${FULL_MARGIN_T}px`;
  const navBorderRadius = isCollapsed ? "23px"   : "14px";
  // margin-left is always 16px for both states (no transition needed for this)

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        /* Make sure nav content sits above background */
        nav.cfc-nav > div { position: relative; z-index: 1; }

        /* ── Nav link underline ── */
        .cfc-nl {
          position: relative;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.18s ease;
        }
        .cfc-nl::after {
          content: '';
          position: absolute;
          left: 0; bottom: -3px;
          width: 100%; height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--burgundy), #A04A74);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }
        .cfc-nl:hover::after     { transform: scaleX(1); }
        .cfc-nl.is-active::after { transform: scaleX(1); }

        /* ── Brand cross hover ── */
        .cfc-cross {
          transition: transform 0.36s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .cfc-cross:hover { transform: rotate(15deg) scale(1.1); }

        /* ── CTA button ── */
        .cfc-cta {
          transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.24s ease, background 0.36s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
        .cfc-cta:hover  { transform: translateY(-2px); }
        .cfc-cta:active { transform: translateY(0); }

        /* ── Hamburger ── */
        .cfc-hb {
          display: block;
          height: 2px;
          border-radius: 2px;
          background: var(--burgundy);
          transition: transform 0.36s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.22s ease, width 0.30s ease;
        }

        /* ── Mobile overlay ── */
        .cfc-ov { transition: background-color 0.34s ease, backdrop-filter 0.34s ease; }

        /* ── Mobile drawer items ── */
        @keyframes cfc-mIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .cfc-mi {
          opacity: 0;
          animation: cfc-mIn 0.30s ease-out forwards;
          animation-delay: var(--d, 0ms);
        }
      `}</style>

      {/* ── SPACER: dynamic based on page layout (0 for home to let hero overlay, 60 for other pages) ── */}
      <div
        aria-hidden="true"
        style={{
          height: pathname === "/" ? 0 : 60,
          flexShrink: 0,
          transition: "height 0.3s ease",
        }}
      />

      {/* ── FIXED OUTER WRAPPER ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: "none" }}>

        <nav
          className={`cfc-nav${isCollapsed ? " is-collapsed" : ""}`}
          onMouseEnter={() => setNavHovered(true)}
          onMouseLeave={() => setNavHovered(false)}
          style={{
            position:      "relative",
            pointerEvents: "auto",
            overflow:      "visible",
            marginLeft:    "16px",         // always 16px — both full & compact are islands

            /* Animated shape */
            width:        navWidth,
            height:       navHeight,
            marginTop:    navMarginTop,
            borderRadius: navBorderRadius,

            /* Colour */
            background:           navBg,
            backdropFilter:       navBackdrop,
            WebkitBackdropFilter: navBackdrop,

            /* Border — all four explicit, no shorthand */
            borderTop:    border,
            borderRight:  border,
            borderBottom: border,
            borderLeft:   border,

            /* Shadow */
            boxShadow: navShadow,

            /* Transition */
            transition: [
              "width 0.46s cubic-bezier(0.4,0,0.2,1)",
              "height 0.46s cubic-bezier(0.4,0,0.2,1)",
              "margin-top 0.46s cubic-bezier(0.4,0,0.2,1)",
              "border-radius 0.46s cubic-bezier(0.4,0,0.2,1)",
              "background 0.40s ease",
              "backdrop-filter 0.40s ease",
              "box-shadow 0.40s ease",
              "border-color 0.40s ease",
            ].join(", "),
          }}
        >
          {/* Content row */}
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              height:         "100%",
              padding:        isCollapsed ? "0 12px" : "0 20px",
              maxWidth:       isCollapsed ? "none"   : "1300px",
              margin:         isCollapsed ? "0"      : "0 auto",
              transition:     "padding 0.46s ease",
            }}
          >
            {/* ── BRAND ── */}
            <Link href="/" className="flex items-center shrink-0" style={{ textDecoration: "none", gap: 9 }}>
              <div
                className="cfc-cross"
                style={{
                  width: 30, height: 30,
                  borderRadius:   "50%",
                  background:     iconBg,
                  border:         iconBorder,
                  boxShadow:      iconShadow,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  transition:     "background 0.40s ease, border 0.40s ease, box-shadow 0.40s ease",
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none"
                  stroke="white" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="3"  x2="12" y2="21" />
                  <line x1="3"  y1="12" x2="21" y2="12" />
                </svg>
              </div>

              <div style={{ whiteSpace: "nowrap" }}>
                <span
                  className="font-playfair"
                  style={{
                    display: "block", fontSize: isCollapsed ? 11.5 : 12, fontWeight: 700,
                    color: nameColor, letterSpacing: "0.025em", lineHeight: 1.25,
                    transition: "color 0.38s ease, font-size 0.38s ease",
                  }}
                >
                  Christian Fellowship
                </span>
                <span
                  className="font-lato"
                  style={{
                    display: "block", fontSize: 8, fontWeight: 600,
                    color: subtitleColor, letterSpacing: "0.26em",
                    textTransform: "uppercase", marginTop: 1,
                    transition: "color 0.38s ease",
                  }}
                >
                  Church
                </span>
              </div>
            </Link>

            {/* ── DESKTOP LINKS — hidden when collapsed ── */}
            <div
              className="hidden md:flex"
              style={{
                alignItems:    "center",
                gap:           20,
                opacity:       isCollapsed ? 0 : 1,
                visibility:    isCollapsed ? "hidden" : "visible",
                transform:     isCollapsed ? "translateY(-5px)" : "translateY(0)",
                pointerEvents: isCollapsed ? "none" : "auto",
                transition:    "opacity 0.22s ease, visibility 0.22s, transform 0.22s ease",
              }}
            >
              {NAV_LINKS.map(({ key, href, scroll }) => {
                const label = t(`nav.${key}`);
                const isActive = key === "home"
                  ? pathname === "/"
                  : pathname.startsWith(href) && href !== "/";

                const linkStyle: React.CSSProperties = {
                  color: isActive ? "var(--burgundy)" : "#65535e",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: 10.5, letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-lato), sans-serif",
                  background: "none", border: "none", padding: 0,
                };

                const cls = `cfc-nl${isActive ? " is-active" : ""}`;

                if (scroll === "footer-visit") {
                  return (
                    <button key={key} onClick={handleVisitUs} suppressHydrationWarning
                      className={cls} style={linkStyle}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--burgundy)"; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#65535e"; }}
                    >{label}</button>
                  );
                }
                return (
                  <Link key={key} href={href} className={cls} style={linkStyle}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--burgundy)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#65535e"; }}
                  >{label}</Link>
                );
              })}
            </div>

            {/* ── RIGHT: CTA + language switcher + hamburger ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

              {/* Announcements Drawer */}
              <div
                style={{
                  opacity:       isCollapsed ? 0 : 1,
                  visibility:    isCollapsed ? "hidden" : "visible",
                  transform:     isCollapsed ? "scale(0.88)" : "none",
                  pointerEvents: isCollapsed ? "none" : "auto",
                  transition:    "opacity 0.22s ease, visibility 0.22s, transform 0.22s ease",
                  display:       "flex",
                  alignItems:    "center",
                }}
              >
                <AnnouncementsDrawer />
              </div>

              {/* Language Switcher */}
              <div
                className="hidden md:block"
                style={{
                  opacity:       isCollapsed ? 0 : 1,
                  visibility:    isCollapsed ? "hidden" : "visible",
                  transform:     isCollapsed ? "scale(0.88)" : "scale(1)",
                  pointerEvents: isCollapsed ? "none" : "auto",
                  transition:    "opacity 0.22s ease, visibility 0.22s, transform 0.22s ease",
                }}
              >
                <LanguageToggle compact={isCollapsed} />
              </div>

              {/* Join Us Live */}
              <div
                className="hidden md:block"
                style={{
                  opacity:       isCollapsed ? 0 : 1,
                  visibility:    isCollapsed ? "hidden" : "visible",
                  transform:     isCollapsed ? "scale(0.88)" : "scale(1)",
                  pointerEvents: isCollapsed ? "none" : "auto",
                  transition:    "opacity 0.22s ease, visibility 0.22s, transform 0.22s ease",
                }}
              >
                <Link
                  href="/join-us-live"
                  className="cfc-cta"
                  style={{
                    gap: 6, padding: "7px 14px", borderRadius: 40,
                    background: pathname === "/join-us-live"
                      ? "linear-gradient(135deg, var(--burgundy-dark) 0%, #3a1022 100%)"
                      : "linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-dark) 100%)",
                    color: "white", fontSize: 10, fontWeight: 600,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    fontFamily: "var(--font-lato), sans-serif",
                    boxShadow: pathname === "/join-us-live"
                      ? "0 2px 12px rgba(58,16,34,0.40)"
                      : "0 2px 14px rgba(140,58,99,0.32)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "inline-block", flexShrink: 0 }} />
                  {t("nav.joinUsLive")}
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                suppressHydrationWarning
                className="md:hidden flex flex-col justify-center items-center shrink-0"
                style={{ width: 32, height: 32, gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => setMenuOpen(v => !v)}
                aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                aria-expanded={menuOpen}
              >
                <span className="cfc-hb" style={{ width: 20, transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
                <span className="cfc-hb" style={{ width: 12, alignSelf: "flex-start", opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "scaleX(1)" }} />
                <span className="cfc-hb" style={{ width: 20, transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ── MOBILE BACKDROP ── */}
      <div
        className="cfc-ov fixed inset-0 z-40 md:hidden"
        style={{
          backgroundColor:      menuOpen ? "rgba(10,3,8,0.52)" : "rgba(10,3,8,0)",
          backdropFilter:       menuOpen ? "blur(6px)" : "blur(0px)",
          WebkitBackdropFilter: menuOpen ? "blur(6px)" : "blur(0px)",
          pointerEvents:        menuOpen ? "auto" : "none",
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── MOBILE DRAWER ── */}
      <div
        className="fixed left-0 right-0 z-50 md:hidden"
        style={{
          top:             DRAWER_TOP,
          opacity:         menuOpen ? 1 : 0,
          transform:       menuOpen ? "translateY(0) scaleY(1)" : "translateY(-10px) scaleY(0.97)",
          transformOrigin: "top center",
          pointerEvents:   menuOpen ? "auto" : "none",
          transition:      "opacity 0.34s cubic-bezier(0.4,0,0.2,1), transform 0.34s cubic-bezier(0.34,1.56,0.64,1)",
          background:      "linear-gradient(160deg, #ffffff 0%, #fdf8fb 100%)",
          borderBottom:    "1px solid rgba(140,58,99,0.10)",
          boxShadow:       menuOpen ? "0 16px 48px rgba(140,58,99,0.16), 0 4px 16px rgba(0,0,0,0.05)" : "none",
        }}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg, #4a1630 0%, var(--burgundy) 50%, #A04A74 100%)" }} />

        <div style={{ display: "flex", flexDirection: "column", paddingTop: 6, paddingBottom: 24 }}>
          {NAV_LINKS.map(({ key, href, scroll }, idx) => {
            const label = t(`nav.${key}`);
            const isActive = key === "home"
              ? pathname === "/"
              : pathname.startsWith(href) && href !== "/";

            const base: React.CSSProperties = {
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 28px",
              fontFamily: "var(--font-lato), sans-serif",
              fontSize: 12, fontWeight: isActive ? 700 : 400,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: isActive ? "var(--burgundy)" : "#2d1922",
              background: isActive ? "linear-gradient(90deg, rgba(140,58,99,0.07) 0%, transparent 80%)" : "transparent",
              borderBottom: "1px solid #f3eef1",
              textDecoration: "none", cursor: "pointer",
              ["--d" as string]: `${idx * 48}ms`,
            };

            const dot = (
              <span style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0, display: "inline-block",
                background: isActive ? "var(--burgundy)" : "rgba(140,58,99,0.22)",
                boxShadow: isActive ? "0 0 0 2.5px rgba(140,58,99,0.18)" : "none",
              }} />
            );

            if (scroll === "footer-visit") {
              return (
                <button key={key} onClick={handleVisitUs} suppressHydrationWarning
                  className="cfc-mi"
                  style={{ ...base, border: "none", borderBottom: "1px solid #f3eef1", textAlign: "left", width: "100%" }}
                >{dot}{label}</button>
              );
            }
            return (
              <Link key={key} href={href} onClick={() => setMenuOpen(false)} className="cfc-mi" style={base}>
                {dot}{label}
              </Link>
            );
          })}

          {/* Mobile Language Switcher */}
          <div
            className="cfc-mi"
            style={{
              padding: "20px 28px 4px",
              display: "flex",
              justifyContent: "center",
              ["--d" as string]: `${NAV_LINKS.length * 48}ms`,
            }}
          >
            <LanguageToggle />
          </div>

          <div style={{ padding: "10px 28px 4px" }}>
            <Link
              href="/join-us-live"
              onClick={() => setMenuOpen(false)}
              className="cfc-cta cfc-mi"
              style={{
                justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 40, width: "100%",
                background: "linear-gradient(135deg, #4a1630 0%, var(--burgundy) 55%, #A04A74 100%)",
                color: "white", fontSize: 11.5, fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase",
                fontFamily: "var(--font-lato), sans-serif",
                boxShadow: "0 4px 20px rgba(74,22,48,0.38)",
                ["--d" as string]: `${(NAV_LINKS.length + 1) * 48}ms`,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.88)", display: "inline-block", flexShrink: 0 }} />
              {t("nav.joinUsLive")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
