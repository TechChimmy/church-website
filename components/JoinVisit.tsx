"use client";

import { usePathname, useRouter } from "next/navigation";

type JoinVisitProps = {
  joinUsText: string;
  visitUsText: string;
};

export default function JoinVisit({ joinUsText, visitUsText }: JoinVisitProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Smoothly scroll to the Footer section (id="footer-visit") instead of
  // navigating — mirrors the existing "Visit Us" handler in Navbar.tsx.
  function handleGetDirections(e: React.MouseEvent) {
    e.preventDefault();
    const doScroll = () => {
      const el = document.getElementById("footer-visit");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (pathname === "/") {
      doScroll();
    } else {
      router.push("/?scrollTo=footer-visit");
    }
  }

  const cards = [
    { title: "Join Us Live", body: joinUsText,  cta: "Watch Now",       href: "/join-us-live", onClick: undefined },
    { title: "Visit Us",     body: visitUsText, cta: "Get Directions",  href: "/",              onClick: handleGetDirections },
  ];

  return (
    <div className="flex flex-col sm:grid sm:[grid-template-columns:180px_1fr_1fr] bg-white"
      style={{ borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
      {/* Thumbnail */}
      <div className="min-h-[100px] sm:min-h-[130px] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #3D1126, #6D2C4E)" }}>
        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="rgba(243,233,229,0.35)">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Cards */}
      {cards.map((card, i) => (
        <div key={card.title}
          className="px-6 sm:px-8 py-6 sm:py-7 group"
          style={{
            borderTop: "1px solid rgba(140,58,99,0.1)",
            borderLeft: i === 0 ? "1px solid rgba(140,58,99,0.1)" : undefined,
            ...(i > 0 ? { borderLeft: "1px solid rgba(140,58,99,0.1)" } : {}),
          }}>
          <div className="w-5 h-[2px] rounded-full mb-3 transition-all duration-200 group-hover:w-8"
            style={{ backgroundColor: "var(--burgundy)" }} />
          <h3 className="font-playfair text-[17px] sm:text-[19px] font-semibold mb-2"
            style={{ color: "var(--text-dark)" }}>
            {card.title}
          </h3>
          <p className="font-lato text-[13px] leading-relaxed mb-4" style={{ color: "#8A7078" }}>
            {card.body}
          </p>
          <a href={card.href} onClick={card.onClick} className="btn-dark">{card.cta}</a>
        </div>
      ))}
    </div>
  );
}
