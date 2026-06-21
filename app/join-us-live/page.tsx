import Navbar from "@/components/Navbar";
import FooterContact from "@/components/FooterContact";
import ServiceTimes from "@/components/ServiceTimes";
import YouTubeLivePlayer from "@/components/youtube-live-player";
import PreviousSermons from "@/components/previous-sermons";
import JoinAskCollins from "@/components/JoinAskCollins";
import { getChannelVideoData, buildEmbedUrl, buildWatchUrl } from "@/lib/youtube";
import { getAllSettings } from "@/lib/settings";

export const metadata = {
  title: "Join Us Live — Christian Fellowship Church",
  description: "Watch our live Sunday service or catch up on recent sermons.",
};

export const dynamic = "force-dynamic";

export default async function JoinUsLivePage() {
  const [{ mainVideo, isCurrentlyLive, recentSermons }, settings] = await Promise.all([
    getChannelVideoData(),
    getAllSettings(),
  ]);

  const embedUrl = mainVideo ? buildEmbedUrl(mainVideo.videoId, isCurrentlyLive) : "";
  const watchUrl = mainVideo ? buildWatchUrl(mainVideo.videoId) : "https://www.youtube.com";

  const contact = {
    address: settings.church_address ?? "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    phone: settings.church_phone ?? "+91 98876 54321",
    email: settings.church_email ?? "info@cftchurch.com",
    mapUrl: settings.map_embed_url ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  return (
    <main>
      <Navbar />
      <section className="px-4 sm:px-10 pt-8 pb-4 bg-white">
        <div className="max-w-[1280px] mx-auto">
          {isCurrentlyLive && (
            <p className="font-lato text-[11px] uppercase tracking-widest text-red-600 font-bold mb-2">
              ● Live Now
            </p>
          )}
          <YouTubeLivePlayer
            video={mainVideo}
            embedUrl={embedUrl}
            watchUrl={watchUrl}
            isLive={isCurrentlyLive}
          />
        </div>
      </section>
      <PreviousSermons sermons={recentSermons} />
      <JoinAskCollins />
      <ServiceTimes />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
