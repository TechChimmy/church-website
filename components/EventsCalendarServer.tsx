// EventsCalendarServer.tsx — Server Component
// Reads from Event table (single source of truth — same as Admin > Events and /events page)
import EventsCalendar from "./EventsCalendar";
import { fetchCalendarEvents } from "@/lib/sanity-queries";

export default async function EventsCalendarServer() {
  try {
    const events = await fetchCalendarEvents();

    const eventsMap: Record<string, string[]> = {};
    events.forEach((ev: { title: string; date: string | Date }) => {
      const d = typeof ev.date === "string" ? new Date(ev.date) : ev.date;
      const key = d.toISOString().split("T")[0];
      (eventsMap[key] ??= []).push(ev.title);
    });

    return <EventsCalendar events={eventsMap} />;
  } catch (err) {
    console.error("[EventsCalendarServer] Sanity error:", err);
    return <EventsCalendar events={{}} />;
  }
}

