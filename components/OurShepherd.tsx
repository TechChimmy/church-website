"use client";

type OurShepherdProps = {
  heading: string;
  body: string;
  imageUrl?: string;
};

export default function OurShepherd({ heading, body, imageUrl }: OurShepherdProps) {
  const [firstWord, ...restWords] = heading.split(" ");
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 w-full" style={{ minHeight: "420px" }}>
      {/* Left: dark card */}
      <div className="px-6 sm:px-12 py-10 sm:py-14 flex flex-col justify-center"
        style={{ background: "linear-gradient(135deg, #1F0D16 0%, #3D1126 50%, #2A0E1C 100%)" }}>
        <div className="w-8 h-[2px] rounded-full mb-5" style={{ backgroundColor: "var(--accent-beige)" }} />
        <h2 className="font-playfair text-[22px] sm:text-[26px] font-bold text-white mb-5 leading-tight">
          {firstWord}{" "}
          <span style={{ color: "var(--accent-beige)" }}>{restWords.join(" ")}</span>
        </h2>
        <p className="font-lato text-[13px] leading-[1.85] mb-3"
          style={{ color: "rgba(243,233,229,0.75)" }}>
          {body}
        </p>
        <a href="#"
          className="font-lato text-[11px] font-bold uppercase tracking-[1.4px] px-6 py-[10px]
                     rounded-sm no-underline transition-all duration-200 self-start mt-4 will-change-transform"
          style={{ backgroundColor: "var(--accent-beige)", color: "var(--burgundy-dark)" }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "white";
            el.style.transform = "translateY(-1px)";
            el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "var(--accent-beige)";
            el.style.transform = "";
            el.style.boxShadow = "";
          }}
        >
          Learn More
        </a>
      </div>

      {/* Right: image */}
      <div className="relative overflow-hidden order-first sm:order-last">
        <div
          className="w-full h-full flex items-center justify-center min-h-[250px] sm:min-h-[420px]"
          style={{
          backgroundImage: `url('${imageUrl || "/images/about/pastor.jpg"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        />
      </div>
    </section>
  );
}
