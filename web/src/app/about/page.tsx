import Navbar from "@/components/ui/Navbar";
import FooterContact from "@/components/ui/FooterContact";
import AboutHero from "@/components/about/AboutHero";
import AboutUsSection from "@/components/about/AboutUsSection";
import OurShepherd from "@/components/about/OurShepherd";
import PraySection from "@/components/home/PraySection";
import OurDoctrine from "@/components/home/OurDoctrine";
import OurCommunityServer from "@/components/home/OurCommunityServer";
import ServiceTimes from "@/components/home/ServiceTimes";
import { getAllSettings } from "@/lib/settings";
import { fetchFooter, fetchPrayerRequestsApproved, fetchServiceTimes } from "@/lib/sanity-queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us — Christian Fellowship Church",
  description: "Learn about Christian Fellowship Church, our shepherd, doctrine, and community.",
};

async function safeGetApprovedPrayers() {
  try {
    const items = await fetchPrayerRequestsApproved();
    return items.map((p: any) => ({
      id: p._id,
      name: p.anonymous ? "Anonymous" : (p.name ?? "Anonymous"),
      prayerRequest: p.prayerRequest ?? "",
      anonymous: p.anonymous ?? false,
      createdAt: p.createdAt,
    }));
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const [settings, footer, prayers, servicesData] = await Promise.all([
    getAllSettings(),
    fetchFooter(),
    safeGetApprovedPrayers(),
    fetchServiceTimes().catch(() => []),
  ]);

  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    addressTa: footer?.addressTa ?? settings.church_address_ta ?? "75, அண்ணா சாலை, சென்னை,\nதமிழ்நாடு 600002, இந்தியா.",
    phone: footer?.phone ?? settings.church_phone ?? "+91 98876 54321",
    email: footer?.email ?? settings.church_email ?? "info@cftchurch.com",
    mapUrl: footer?.mapEmbed ?? settings.map_embed_url ??
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

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
      <AboutHero
        imageUrl={settings.about_image ?? ""}
        title={settings.about_hero_title}
        titleTa={settings.about_hero_title_ta}
        subtitle={settings.about_hero_subtitle}
        subtitleTa={settings.about_hero_subtitle_ta}
      />
      <AboutUsSection
        heading={settings.about_heading ?? "About Us"}
        headingTa={settings.about_heading_ta ?? "எங்களைப் பற்றி"}
        body={settings.about_body ?? "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage."}
        bodyTa={settings.about_body_ta ?? "விசுவாசம், அன்பு மற்றும் கிறிஸ்தவ ஐக்கியத்தின் மூலம் ஒரு புதிய சமூதாயத்தை உருவாக்குவதே எங்களின் நோக்கம்."}
      />
      <OurShepherd
        heading={settings.shepherd_heading ?? "Our Shepherd"}
        headingTa={settings.shepherd_heading_ta ?? "எங்கள் மேய்ப்பர்"}
        body={settings.shepherd_body ?? "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment."}
        bodyTa={settings.shepherd_body_ta ?? "அன்பான மேய்ப்பராக சபை மக்களை வழிநடத்தி தேவனுடைய சத்தியத்தை பிரசங்கித்து வருகிறார்."}
        imageUrl={settings.shepherd_image ?? ""}
      />
      <PraySection
        heading={settings.pray_heading ?? "Pray with us"}
        headingTa={settings.pray_heading_ta ?? "எங்களோடு ஜெபியுங்கள்"}
        initialPrayers={prayers}
      />
      <OurDoctrine
        images={{
          word:   settings.doctrine_word_image,
          faith:  settings.doctrine_faith_image,
          spirit: settings.doctrine_spirit_image,
          church: settings.doctrine_church_image,
        }}
        heading={settings.doctrine_heading}
        headingTa={settings.doctrine_heading_ta}
        paragraph={settings.doctrine_paragraph}
        paragraphTa={settings.doctrine_paragraph_ta}
        items={{
          word:   { title: settings.doctrine_word_title,   titleTa: settings.doctrine_word_title_ta,   desc: settings.doctrine_word_desc,   descTa: settings.doctrine_word_desc_ta },
          faith:  { title: settings.doctrine_faith_title,  titleTa: settings.doctrine_faith_title_ta,  desc: settings.doctrine_faith_desc,  descTa: settings.doctrine_faith_desc_ta },
          spirit: { title: settings.doctrine_spirit_title, titleTa: settings.doctrine_spirit_title_ta, desc: settings.doctrine_spirit_desc, descTa: settings.doctrine_spirit_desc_ta },
          church: { title: settings.doctrine_church_title, titleTa: settings.doctrine_church_title_ta, desc: settings.doctrine_church_desc, descTa: settings.doctrine_church_desc_ta },
        }}
      />
      <OurCommunityServer />
      <ServiceTimes services={serviceTimes} />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
