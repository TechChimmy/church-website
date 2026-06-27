"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function EventsCalendar({ events = {} }: { events?: Record<string, string[]> }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function changeMonth(dir: number) {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m);
    setYear(y);
  }


  const firstDay     = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const totalCells   = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDay + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  // Split into rows of 7
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <motion.section
      className="py-10 sm:py-14 px-4 sm:px-10 bg-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="font-playfair text-[24px] font-bold text-stone-900 text-center mb-7">
        Our Events
      </h2>

      <div className="max-w-[740px] mx-auto">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="w-8 h-8 border border-stone-300 flex items-center justify-center
                       text-xl text-stone-600 hover:bg-stone-900 hover:text-white
                       hover:border-stone-900 transition-colors rounded-sm leading-none"
          >
            ‹
          </button>
          <span className="font-playfair text-[16px] font-semibold text-stone-900">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="w-8 h-8 border border-stone-300 flex items-center justify-center
                       text-xl text-stone-600 hover:bg-stone-900 hover:text-white
                       hover:border-stone-900 transition-colors rounded-sm leading-none"
          >
            ›
          </button>
        </div>

        {/* Calendar table */}
        <table className="w-full border-collapse border border-stone-200 table-fixed">
          <thead>
            <tr>
              {DAY_LABELS.map((d) => (
                <th key={d}
                  className="py-2 font-lato text-[11px] font-bold uppercase tracking-widest
                             text-stone-400 bg-stone-50 border border-stone-200 text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((day, ci) => {
                  if (!day) {
                    return (
                      <td key={ci}
                        className="border border-stone-200 p-2 bg-stone-50/60"
                        style={{ minHeight: 72 }} />
                    );
                  }
                  const key    = dateKey(year, month, day);
                  const evs    = events[key] ?? [];
                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                  return (
                    <td key={ci}
                      className="border border-stone-200 p-2 align-top hover:bg-stone-50
                                 transition-colors"
                      style={{ minHeight: 72 }}>
                      <span className={`
                        font-lato text-[12px] font-bold mb-1 w-6 h-6
                        flex items-center justify-center rounded-full
                        ${isToday
                          ? "bg-stone-900 text-white"
                          : "text-stone-700"}
                      `}>
                        {day}
                      </span>
                      {evs.map((ev, ei) => (
                        <span key={ei}
                          className="block font-lato text-[10px] font-bold bg-[var(--burgundy)]
                                     text-white px-1.5 py-0.5 rounded-sm mt-0.5
                                     truncate tracking-[0.2px]">
                          {ev}
                        </span>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
