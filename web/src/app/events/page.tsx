import Navbar from "@/components/ui/Navbar";
import FooterContact from "@/components/ui/FooterContact";
import EventsHero from "@/components/events/EventsHero";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import WeStayActive from "@/components/events/WeStayActive";
import CalendarOfEvents from "@/components/events/CalendarOfEvents";
import OurCommunityServer from "@/components/home/OurCommunityServer";
import ServiceTimes from "@/components/home/ServiceTimes";
import { fetchEvents, fetchFooter, fetchWeStayActive, fetchServiceTimes } from "@/lib/sanity-queries";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events — Christian Fellowship Church",
  description: "Upcoming events, calendar, and community activities at Christian Fellowship Church.",
};

export default async function EventsPage() {
  const [events, settings, footer, activeItems, servicesData] = await Promise.all([
    fetchEvents({ activeOnly: true }).catch(() => []),
    getAllSettings(),
    fetchFooter(),
    fetchWeStayActive({ activeOnly: true }).catch(() => []),
    fetchServiceTimes().catch(() => []),
  ]);

  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai, Tamil Nadu 600002, India.",
    addressTa: footer?.addressTa ?? settings.church_address_ta ?? "75, அண்ணா சாலை, சென்னை, தமிழ்நாடு 600002, இந்தியா.",
    phone:   footer?.phone   ?? settings.church_phone   ?? "+91 98876 54321",
    email:   footer?.email   ?? settings.church_email   ?? "info@cftchurch.com",
    mapUrl:  footer?.mapEmbed  ?? settings.map_embed_url  ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  const upcomingEvents = events.map((ev: any) => ({
    id:       ev._id ?? ev.id,
    date:     ev.date,
    title:    ev.title,
    titleTa:  ev.titleTa,
    desc:     ev.description ?? "",
    descTa:   ev.descriptionTa ?? "",
    imageUrl: ev.imageUrl ?? "",
    time:     ev.time ?? undefined,
    timeTa:   ev.timeTa ?? undefined,
    location: ev.location ?? undefined,
    locationTa: ev.locationTa ?? undefined,
  }));

  const serviceTimes = servicesData.map((svc: any, idx: number) => ({
    id: svc._id ?? svc.id ?? `s-${idx}`,
    title: svc.name ?? svc.title ?? svc.day ?? "Service",
    titleTa: svc.nameTa ?? svc.titleTa ?? svc.dayTa ?? "ஆராதனை",
    day: svc.day ?? "",
    dayTa: svc.dayTa ?? "",
    time: svc.time ?? "",
    timeTa: svc.timeTa ?? "",
  }));

  return (
    <main>
      <Navbar />
      <EventsHero imageUrl={settings.events_banner_image} />
      <UpcomingEvents events={upcomingEvents} />
      <WeStayActive items={activeItems} />
      <CalendarOfEvents />
      <OurCommunityServer />
      <ServiceTimes services={serviceTimes} />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
