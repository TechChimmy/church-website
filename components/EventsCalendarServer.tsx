// EventsCalendarServer.tsx — Server Component
// Reads from Event table (single source of truth — same as Admin > Events and /events page)
import { prisma } from "@/lib/prisma";
import EventsCalendar from "./EventsCalendar";

export default async function EventsCalendarServer() {
  try {
    const events = await prisma.event.findMany({
      where:   { active: true },
      orderBy: { date: "asc" },
      select:  { title: true, date: true },
    });

    const eventsMap: Record<string, string[]> = {};
    events.forEach((ev: { title: string; date: Date }) => {
      const key = ev.date.toISOString().split("T")[0];
      (eventsMap[key] ??= []).push(ev.title);
    });

    return <EventsCalendar events={eventsMap} />;
  } catch (err) {
    console.error("[EventsCalendarServer] DB error:", err);
    return <EventsCalendar events={{}} />;
  }
}
