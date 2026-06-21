import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import JoinVisit from "@/components/JoinVisit";
import AboutSection from "@/components/AboutSection";
import PraySection from "@/components/PraySection";
import EventsCalendarServer from "@/components/EventsCalendarServer";
import UpcomingEvents from "@/components/UpcomingEvents";
import ServiceTimes from "@/components/ServiceTimes";
import FooterContact from "@/components/FooterContact";
import ScrollToAnchor from "@/components/ScrollToAnchor";
import { prisma } from "@/lib/prisma";
import { getAllSettings } from "@/lib/settings";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function safeGetSlides() {
  try {
    return await prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch { return []; }
}

// Same source of truth as Admin > Events (/admin/events) and the /events page:
// the `Event` model. Shows only the next few upcoming, active events on the homepage.
async function safeGetUpcomingEvents() {
  try {
    const events = await prisma.event.findMany({
      where:   { active: true, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { date: "asc" },
      take:    4,
    });
    return events.map((ev: { id: string; date: Date; title: string; description: string; imageUrl: string | null; time: string | null; location: string | null }) => ({
      id:       ev.id,
      date:     new Date(ev.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
      title:    ev.title,
      desc:     ev.description ?? "",
      imageUrl: ev.imageUrl ?? "",
      time:     ev.time ?? undefined,
      location: ev.location ?? undefined,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [slides, settings, upcomingEvents] = await Promise.all([
    safeGetSlides(),
    getAllSettings(),
    safeGetUpcomingEvents(),
  ]);

  const heroSlides = slides.length
    ? slides
    : [
        {
          id: "default-1",
          imageUrl: "",
          title: "Welcome Home",
          subtitle: "Sunday Service · 9am & 11am",
          ctaText: "Join Us Live",
          ctaHref: "/join-us-live",
          order: 0,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

  const contact = {
    address: settings.church_address ?? "75, Anna Salai, Chennai, Tamil Nadu 600002, India.",
    phone: settings.church_phone ?? "+91 98876 54321",
    email: settings.church_email ?? "info@cftchurch.com",
    mapUrl: settings.map_embed_url ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  return (
    <main>
      <Navbar />
      <HeroSlider slides={heroSlides.map((slide: { id: string; imageUrl: string; title: string; subtitle: string; ctaText: string; ctaHref: string }) => ({
        id: slide.id,
        gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
        imageUrl: slide.imageUrl,
        title: slide.title,
        subtitle: slide.subtitle,
        ctaText: slide.ctaText,
        ctaHref: slide.ctaHref,
      }))}
      />
      <JoinVisit
        joinUsText={settings.join_us_text ?? "Your paragraph lorem ipsum the warmth and charm of a cosy service — join us online wherever you are."}
        visitUsText={settings.visit_us_text ?? "Your paragraph lorem ipsum the warmth and charm of a cosy service — we'd love to see you in person this Sunday."}
      />
      <AboutSection
        heading={settings.about_heading ?? "About Us"}
        body={settings.about_body ?? "Your paragraph lorem ipsum the warmth and charm of a cosy Sunday afternoon spent in a quaint countryside cottage."}
      />
      <PraySection heading={settings.pray_heading ?? "Pray with us"} />
      {upcomingEvents.length > 0 && <UpcomingEvents events={upcomingEvents} />}
      <EventsCalendarServer />
      <ServiceTimes />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
      <Suspense fallback={null}>
        <ScrollToAnchor />
      </Suspense>
    </main>
  );
}
