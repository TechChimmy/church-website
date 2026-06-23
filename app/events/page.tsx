import Navbar from "@/components/Navbar";
import FooterContact from "@/components/FooterContact";
import EventsHero from "@/components/EventsHero";
import UpcomingEvents from "@/components/UpcomingEvents";
import WeStayActive from "@/components/WeStayActive";
import CalendarOfEvents from "@/components/CalendarOfEvents";
import OurCommunityServer from "@/components/OurCommunityServer";
import ServiceTimes from "@/components/ServiceTimes";
import { prisma } from "@/lib/prisma";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events — Christian Fellowship Church",
  description: "Upcoming events, calendar, and community activities at Christian Fellowship Church.",
};

export default async function EventsPage() {
  const [events, settings] = await Promise.all([
    // Single source of truth: Event table (created via Admin > Events)
    prisma.event.findMany({ where: { active: true }, orderBy: { date: "asc" } }).catch(() => []),
    getAllSettings(),
  ]);

  const contact = {
    address: settings.church_address ?? "75, Anna Salai, Chennai, Tamil Nadu 600002, India.",
    phone:   settings.church_phone   ?? "+91 98876 54321",
    email:   settings.church_email   ?? "info@cftchurch.com",
    mapUrl:  settings.map_embed_url  ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  const upcomingEvents = events.map((ev: { id: string; date: Date; title: string; description: string; imageUrl: string | null; time: string | null; location: string | null }) => ({
    id:       ev.id,
    date:     new Date(ev.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
    title:    ev.title,
    desc:     ev.description ?? "",
    imageUrl: ev.imageUrl ?? "",
    time:     ev.time ?? undefined,
    location: ev.location ?? undefined,
  }));

  return (
    <main>
      <Navbar />
      <EventsHero imageUrl={settings.events_banner_image} />
      <UpcomingEvents events={upcomingEvents} />
      <WeStayActive images={{
        fellowship:  settings.activity_fellowship_image,
        retreat:     settings.activity_retreat_image,
        evangelical: settings.activity_evangelical_image,
      }} />
      <CalendarOfEvents />
      <OurCommunityServer />
      <ServiceTimes />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
