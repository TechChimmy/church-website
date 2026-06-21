"use client";

export default function AskCollinsHero() {
  return (
    <section
      className="relative w-full h-[220px] overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1F0D16 0%, #6D2C4E 50%, #3D1126 100%)" }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(31,5,20,0.45)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(243,233,229,0.4), transparent)" }} />
      <div className="relative z-10 text-center">
        <p className="font-lato text-[12px] uppercase tracking-[3px]"
          style={{ color: "rgba(243,233,229,0.6)" }}>
          Build banner image
        </p>
      </div>
    </section>
  );
}
