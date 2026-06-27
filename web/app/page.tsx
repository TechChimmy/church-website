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
import { getAllSettings } from "@/lib/settings";
import { Suspense } from "react";
import { fetchHeroSlides, fetchEvents, fetchPrayerRequestsApproved, fetchFooter } from "@/lib/sanity-queries";


import { getChannelVideoData } from "@/lib/youtube";

export const revalidate = 60;

async function safeGetSlides() {
  try {
    const slides = await fetchHeroSlides();
    return slides
      .filter((s: any) => s.active)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((s: any) => ({
        id: s._id ?? s.id,
        imageUrl: s.imageUrl ?? "",
        title: s.title,
        subtitle: s.subtitle,
        order: s.order ?? 0,
        active: s.active ?? true,
        ctaText: s.order === 1 ? "About Us" : s.order === 2 ? "Visit Us" : "Join Us Live",
        ctaHref: s.order === 1 ? "/about" : s.order === 2 ? "/about#visit" : "/join-us-live",
      }));
  } catch {
    return [];
  }
}


// Same source of truth as Admin > Events (/admin/events) and the /events page:
// the `Event` document. Shows only the next few active events.
async function safeGetUpcomingEvents() {
  try {
    const events = await fetchEvents({ activeOnly: true });
    return events
      .filter((ev: any) => ev.active !== false)
      .slice(0, 4)
      .map((ev: any) => ({
        id: ev._id ?? ev.id,
        date: new Date(ev.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        title: ev.title,
        desc: ev.description ?? '',
        imageUrl: ev.imageUrl ?? '',
        time: ev.time ?? undefined,
        location: ev.location ?? undefined,
      }));
  } catch {
    return [];
  }
}

async function safeGetApprovedPrayers() {
  try {
    const items = await fetchPrayerRequestsApproved();
    return items.map((p: any) => ({
      id: p._id,
      name: p.name ?? null,
      prayerRequest: p.prayerRequest ?? "",
      anonymous: p.anonymous ?? false,
      createdAt: p.createdAt,
    }));
  } catch {
    return [];
  }
}


export default async function HomePage() {
  const [slides, settings, upcomingEvents, prayers, footer, ytData] = await Promise.all([
    safeGetSlides(),
    getAllSettings(),
    safeGetUpcomingEvents(),
    safeGetApprovedPrayers(),
    fetchFooter(),
    getChannelVideoData(),
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
          createdAt: "2026-06-24T00:00:00Z",
          updatedAt: "2026-06-24T00:00:00Z",
        },
      ];


  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai, Tamil Nadu 600002, India.",
    phone: footer?.phone ?? settings.church_phone ?? "+91 98876 54321",
    email: footer?.email ?? settings.church_email ?? "info@cftchurch.com",
    mapUrl: footer?.mapEmbed ?? settings.map_embed_url ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  return (
    <main>
      <Navbar />
      <HeroSlider slides={heroSlides.map((slide: { id: string; imageUrl: string; title: string; subtitle: string; ctaText: string; ctaHref: string }, idx: number) => {
        const defaultGradients = [
          "from-[#3D1126] via-[#6D2C4E] to-[#4A1A35]",
          "from-[#2A0E1C] via-[#8C3A63] to-[#4D1530]",
          "from-[#1F0D16] via-[#5C2440] to-[#3D1126]",
        ];
        return {
          id: slide.id,
          gradient: defaultGradients[idx % defaultGradients.length],
          imageUrl: slide.imageUrl,
          title: slide.title,
          subtitle: slide.subtitle,
          ctaText: slide.ctaText,
          ctaHref: slide.ctaHref,
        };
      })}
      />
      <JoinVisit
        joinUsText={settings.join_us_text ?? "Your paragraph lorem ipsum the warmth and charm of a cosy service — join us online wherever you are."}
        visitUsText={settings.visit_us_text ?? "Your paragraph lorem ipsum the warmth and charm of a cosy service — we'd love to see you in person this Sunday."}
        mainVideo={ytData.mainVideo}
      />
      <AboutSection
        heading={settings.about_heading ?? "About Us"}
        body={settings.about_body ?? "Your paragraph lorem ipsum the warmth and charm of a cosy Sunday afternoon spent in a quaint countryside cottage."}
      />
      <PraySection heading={settings.pray_heading ?? "Pray with us"} initialPrayers={prayers} />
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

