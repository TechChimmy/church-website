// EventsCalendarServer.tsx — Server Component
// Reads from Event table (single source of truth — same as Admin > Events and /events page)
import dynamic from "next/dynamic";

const EventsCalendar = dynamic(() => import("./EventsCalendar"));
import { fetchCalendarEvents } from "@/lib/sanity-queries";

export default async function EventsCalendarServer() {
  try {
    const events = await fetchCalendarEvents();

    const eventsMap: Record<string, string[]> = {};
    events.forEach((ev: { title: string; date: string | Date }) => {
      if (!ev.date) return;
      try {
        const d = typeof ev.date === "string" ? new Date(ev.date) : ev.date;
        if (isNaN(d.getTime())) return;
        const key = d.toISOString().split("T")[0];
        (eventsMap[key] ??= []).push(ev.title);
      } catch (e) {
        console.error("[EventsCalendarServer] Error parsing date:", e);
      }
    });

    return <EventsCalendar events={eventsMap} />;
  } catch (err) {
    console.error("[EventsCalendarServer] Sanity error:", err);
    return <EventsCalendar events={{}} />;
  }
}

