import Navbar from "@/components/Navbar";
import FooterContact from "@/components/FooterContact";
import AboutHero from "@/components/AboutHero";
import AboutUsSection from "@/components/AboutUsSection";
import OurShepherd from "@/components/OurShepherd";
import AskCollins from "@/components/AskCollins";
import OurDoctrine from "@/components/OurDoctrine";
import OurCommunityServer from "@/components/OurCommunityServer";
import ServiceTimes from "@/components/ServiceTimes";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us — Christian Fellowship Church",
  description: "Learn about Christian Fellowship Church, our shepherd, doctrine, and community.",
};

export default async function AboutPage() {
  const settings = await getAllSettings();

  const contact = {
    address: settings.church_address ?? "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    phone: settings.church_phone ?? "+91 98876 54321",
    email: settings.church_email ?? "info@cftchurch.com",
    mapUrl: settings.map_embed_url ??
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  return (
    <main>
      <Navbar />
      <AboutHero imageUrl={settings.about_image ?? ""} />
      <AboutUsSection
        heading={settings.about_heading ?? "About Us"}
        body={settings.about_body ?? "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage."}
      />
      <OurShepherd
        heading={settings.shepherd_heading ?? "Our Shepherd"}
        body={settings.shepherd_body ?? "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment."}
        imageUrl={settings.shepherd_image ?? ""}
      />
      <AskCollins />
      <OurDoctrine />
      <OurCommunityServer />
      <ServiceTimes />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
