import Navbar from "@/components/ui/Navbar";
import FooterContact from "@/components/ui/FooterContact";
import ServiceTimes from "@/components/home/ServiceTimes";
import JoinUsLiveClient from "@/components/join-us-live/JoinUsLiveClient";
import { getChannelVideoData, buildEmbedUrl, buildWatchUrl } from "@/lib/youtube";
import { getAllSettings } from "@/lib/settings";
import { fetchFooter } from "@/lib/sanity-queries";

export const metadata = {
  title: "Join Us Live — Christian Fellowship Church",
  description: "Watch our live Sunday service or catch up on recent sermons.",
};

export const dynamic = "force-dynamic";

export default async function JoinUsLivePage() {
  const [{ mainVideo, isCurrentlyLive, recentSermons }, settings, footer] = await Promise.all([
    getChannelVideoData(),
    getAllSettings(),
    fetchFooter(),
  ]);

  const embedUrl = mainVideo ? buildEmbedUrl(mainVideo.videoId, isCurrentlyLive) : "";
  const watchUrl = mainVideo ? buildWatchUrl(mainVideo.videoId) : "https://www.youtube.com";

  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    addressTa: footer?.addressTa ?? settings.church_address_ta ?? "75, அண்ணா சாலை, சென்னை,\nதமிழ்நாடு 600002, இந்தியா.",
    phone: footer?.phone ?? settings.church_phone ?? "+91 98876 54321",
    email: footer?.email ?? settings.church_email ?? "info@cftchurch.com",
    mapUrl: footer?.mapEmbed ?? settings.map_embed_url ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  const isApiUnavailable = !mainVideo && recentSermons.length === 0;

  const rawChannelId = process.env.YOUTUBE_CHANNEL_ID || settings.youtube_channel_id || "";
  const hasChannelLink = rawChannelId && rawChannelId !== "your_channel_id";
  const youtubeChannelUrl = hasChannelLink
    ? (rawChannelId.startsWith("http") ? rawChannelId : `https://www.youtube.com/channel/${rawChannelId}`)
    : "https://www.youtube.com";

  return (
    <main>
      <Navbar />
      
      <JoinUsLiveClient
        mainVideo={mainVideo}
        isCurrentlyLive={isCurrentlyLive}
        recentSermons={recentSermons}
        embedUrl={embedUrl}
        watchUrl={watchUrl}
        youtubeChannelUrl={youtubeChannelUrl}
        isApiUnavailable={isApiUnavailable}
      />

      <ServiceTimes />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
