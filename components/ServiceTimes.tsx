// Server Component — reads from database
import { prisma } from "@/lib/prisma";

const FALLBACK = [
  { id:"f1", title:"Service of this kind", day:"Sunday", time:"12:00 AM to 03:00 AM" },
  { id:"f2", title:"Service of this kind", day:"Sunday", time:"12:00 to 03:05 AM" },
  { id:"f3", title:"Service of this kind", day:"Sunday", time:"12:00 AM to 03:00 AM" },
  { id:"f4", title:"Service of this kind", day:"Sunday", time:"12:05 AM to 03:00 AM" },
];

export default async function ServiceTimes() {
  let services = FALLBACK;
  try {
    const rows = await prisma.serviceTime.findMany({
      where: { active: true }, orderBy: { order: "asc" },
    });
    if (rows.length > 0) services = rows;
  } catch { /* DB not ready — use fallback */ }

  const cols = services.slice(0, 4);
  while (cols.length < 4) cols.push(cols[0] ?? FALLBACK[0]);

  return (
    <section className="bg-white" style={{ borderTop: "1px solid rgba(140,58,99,0.1)" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 max-w-[1280px] mx-auto"
        style={{ borderBottom: "1px solid rgba(140,58,99,0.1)" }}>
        {cols.map((svc, i) => (
          <div
            key={svc.id ?? i}
            className="py-8 sm:py-10 px-5 sm:px-8 flex flex-col gap-1
                       transition-colors duration-200 group cursor-default"
            style={{
              borderRight: i < 3 ? "1px solid rgba(140,58,99,0.1)" : "none",
            }}
          >
            {/* Accent dot */}
            <div className="w-1.5 h-1.5 rounded-full mb-2 transition-transform duration-200 group-hover:scale-125"
              style={{ backgroundColor: "var(--burgundy)" }} />
            <h4 className="font-playfair text-[14px] sm:text-[15px] font-semibold mb-1 transition-colors duration-200 group-hover:text-[var(--burgundy)]"
              style={{ color: "var(--text-dark)" }}>
              {svc.title}
            </h4>
            <p className="font-lato text-[12px] sm:text-[12.5px]" style={{ color: "#8A7078" }}>{svc.day}</p>
            <p className="font-lato text-[12px] sm:text-[12.5px]" style={{ color: "#8A7078" }}>{svc.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
