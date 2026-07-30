"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

type CalEv = {
  id: string;
  title: string;
  titleTa?: string;
  description?: string;
  descriptionTa?: string;
  date: string;
  time?: string;
  timeTa?: string;
  endTime?: string;
  color: string;
};

type ModalData = { date: string; events: CalEv[] };

// Shape returned by /api/cms/events (Event model — single source of truth)
type RawEvent = {
  id: string;
  title: string;
  titleTa?: string;
  description: string;
  descriptionTa?: string;
  date: string;
  time?: string | null;
  timeTa?: string | null;
  active: boolean;
};

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export default function CalendarOfEvents() {
  const { lang, t } = useLanguage();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalEv[]>([]);
  const [modal, setModal] = useState<ModalData | null>(null);

  const dayLabels = t("calendar.days", { returnObjects: true }) as unknown as string[];
  const monthNames = t("calendar.months", { returnObjects: true }) as unknown as string[];

  const DAY_LABELS = Array.isArray(dayLabels) ? dayLabels : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTH_NAMES = Array.isArray(monthNames) ? monthNames : ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];

  useEffect(() => {
    // Single source of truth: Event table via /api/cms/events?active=true
    fetch("/api/cms/events?active=true")
      .then(r => r.json())
      .then((data: RawEvent[]) => {
        if (!Array.isArray(data)) return;
        const mapped: CalEv[] = data.map(ev => ({
          id:          ev.id,
          title:       ev.title,
          titleTa:     ev.titleTa,
          description: ev.description || undefined,
          descriptionTa: ev.descriptionTa || undefined,
          date:        ev.date,
          time:        ev.time ?? undefined,
          timeTa:      ev.timeTa ?? undefined,
          endTime:     undefined,
          color:       "#8c3a63",
        }));
        setEvents(mapped);
      })
      .catch(() => {});
  }, []);

  function changeMonth(dir: number) {
    let m = month + dir, y = year;
    if (m > 11) { m=0; y++; }
    if (m < 0)  { m=11; y--; }
    setMonth(m); setYear(y);
  }

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const totalCells  = Math.ceil((firstDay+daysInMonth)/7)*7;
  const cells: (number|null)[] = Array.from({ length: totalCells }, (_,i) => {
    const d = i-firstDay+1; return d>=1&&d<=daysInMonth?d:null;
  });
  const rows: (number|null)[][] = [];
  for (let i=0;i<cells.length;i+=7) rows.push(cells.slice(i,i+7));

  function eventsForDay(d: number) {
    const k = dateKey(year, month, d);
    return events.filter(e => e.date.slice(0,10) === k);
  }

  function handleDayClick(day: number) {
    const evs = eventsForDay(day);
    if (evs.length > 0) {
      setModal({
        date: new Date(year, month, day).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
          weekday:"long", year:"numeric", month:"long", day:"numeric",
        }),
        events: evs,
      });
    }
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 bg-white"
      style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-8 h-[2px] rounded-full mb-3" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[26px] font-bold text-center" style={{ color: "var(--text-dark)" }}>
            {t("calendar.heading")}
          </h2>
        </div>

        <div className="flex items-center justify-between mb-4 max-w-[860px] mx-auto">
          <button onClick={() => changeMonth(-1)} aria-label={t("calendar.prevMonth")}
            suppressHydrationWarning={true}
            className="w-8 h-8 border flex items-center justify-center text-xl
                       transition-all duration-200 rounded-sm leading-none"
            style={{ borderColor: "rgba(140,58,99,0.25)", color: "var(--burgundy)" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "var(--burgundy)";
              el.style.color = "white";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "";
              el.style.color = "var(--burgundy)";
            }}
          >‹</button>
          <span className="font-playfair text-[17px] font-semibold" style={{ color: "var(--text-dark)" }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => changeMonth(1)} aria-label={t("calendar.nextMonth")}
            suppressHydrationWarning={true}
            className="w-8 h-8 border flex items-center justify-center text-xl
                       transition-all duration-200 rounded-sm leading-none"
            style={{ borderColor: "rgba(140,58,99,0.25)", color: "var(--burgundy)" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "var(--burgundy)";
              el.style.color = "white";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = "";
              el.style.color = "var(--burgundy)";
            }}
          >›</button>
        </div>

        <div className="max-w-[860px] mx-auto">
          <table className="w-full border-collapse table-fixed" style={{ border: "1px solid rgba(140,58,99,0.12)" }}>
            <thead>
              <tr>
                {DAY_LABELS.map(d => (
                  <th key={d}
                    className="py-2 font-lato text-[11px] font-bold uppercase tracking-widest text-center"
                    style={{
                      color: "var(--burgundy)",
                      backgroundColor: "rgba(140,58,99,0.05)",
                      border: "1px solid rgba(140,58,99,0.1)",
                    }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((day, ci) => {
                    if (!day) return (
                      <td key={ci} style={{
                        border: "1px solid rgba(140,58,99,0.08)",
                        minHeight: 68,
                        backgroundColor: "rgba(248,246,247,0.5)",
                      }} />
                    );
                    const evs = eventsForDay(day);
                    const isToday = day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
                    return (
                      <td key={ci}
                        onClick={() => handleDayClick(day)}
                        className={`p-1 sm:p-2 align-top transition-colors ${evs.length>0?"cursor-pointer":""}`}
                        style={{
                          border: "1px solid rgba(140,58,99,0.08)",
                          height: "60px",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            evs.length > 0 ? "rgba(140,58,99,0.06)" : "rgba(248,246,247,0.8)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "";
                        }}
                      >
                        <span className="font-lato text-[11px] sm:text-[12px] font-bold mb-1 w-5 h-5 sm:w-6 sm:h-6 flex
                                        items-center justify-center rounded-full"
                          style={isToday ? {
                            backgroundColor: "var(--burgundy)",
                            color: "white",
                          } : { color: "#5A4050" }}>
                          {day}
                        </span>
                        
                        {/* Mobile indicator dots */}
                        {evs.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 sm:hidden">
                            {evs.map((ev, ei) => (
                              <span
                                key={ei}
                                className="w-1.5 h-1.5 rounded-full bg-[var(--burgundy)] block shrink-0"
                              />
                            ))}
                          </div>
                        )}

                        {/* Desktop labels */}
                        <div className="hidden sm:block">
                          {evs.map((ev,ei) => {
                            const eventTitle = lang === "ta" && ev.titleTa ? ev.titleTa : ev.title;
                            return (
                              <span key={ei}
                                className="block font-lato text-[10px] font-bold px-1.5 py-0.5 rounded-sm mt-0.5 truncate"
                                style={{
                                  background: "rgba(140,58,99,0.12)",
                                  color: "var(--burgundy)",
                                }}>
                                {eventTitle}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setModal(null)} />
            <motion.div
              className="fixed z-50 bg-white shadow-2xl w-[calc(100%-2rem)] max-w-[460px] p-8 rounded-sm overflow-y-auto"
              style={{
                top: "50%",
                left: "50%",
                translateX: "-50%",
                translateY: "-50%",
                maxHeight: "90vh",
              }}
              initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.96 }} transition={{ duration:0.2 }}>
              <button onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center
                           text-xl leading-none transition-colors duration-200"
                style={{ color: "#8A7078" }}
                aria-label={t("events.close")}>×</button>
              <p className="font-lato text-[11px] uppercase tracking-widest mb-1"
                style={{ color: "var(--burgundy)" }}>
                {modal.date}
              </p>
              <h3 className="font-playfair text-[20px] font-bold mb-5" style={{ color: "var(--text-dark)" }}>
                {lang === "ta" ? "நிகழ்வுகள்" : "Events"}
              </h3>
              <div className="flex flex-col gap-4">
                {modal.events.map((ev,i) => {
                  const eventTitle = lang === "ta" && ev.titleTa ? ev.titleTa : ev.title;
                  const eventTime = lang === "ta" && ev.timeTa ? ev.timeTa : ev.time;
                  const eventDesc = lang === "ta" && ev.descriptionTa ? ev.descriptionTa : ev.description;

                  return (
                    <div key={i} className="pl-4" style={{ borderLeft: "2px solid var(--burgundy)" }}>
                      <p className="font-playfair text-[15px] font-semibold" style={{ color: "var(--text-dark)" }}>{eventTitle}</p>
                      {eventTime && <p className="font-lato text-[12px] mb-1" style={{ color: "var(--burgundy)" }}>{eventTime}</p>}
                      {eventDesc && (
                        <p className="font-lato text-[12.5px] leading-relaxed" style={{ color: "#8A7078" }}>{eventDesc}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setModal(null)} className="mt-6 btn-primary w-full text-center">
                {t("events.close")}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
